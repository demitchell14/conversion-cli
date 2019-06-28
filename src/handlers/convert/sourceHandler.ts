import {SqlClient} from 'msnodesqlv8';
import {IIDMRowData} from '../../tables'
const sql: SqlClient = require('msnodesqlv8');


export declare interface SourceHandler {
  limit: number;
  offset: number;
  table?: string;
  connectString: string;
  new (props: ImportHandlerProps);
  execute(offset:number): AsyncIterableIterator<Array<Partial<any>>>
  query(query: string): Promise<any>
}

export class SourceHandler {
  limit: number;
  offset: number;
  table?: string;
  connectString: string;

  constructor(props:ImportHandlerProps) {
    this.connectString = `Driver={${process.env.db_driver || ''}};Server=${process.env.db_server || ''};Database=${process.env.db_name || ''};Trusted_Connection=Yes;`
    this.table = props.table || undefined;
    this.limit = props.limit || 1;
    this.offset = props.offset || 0;
  }

  statements = {
    idmAll: (offset:number) => `SELECT * FROM id.IDMP ORDER BY IDM_IDM_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    idmAddr: (offset:number) => `SELECT * FROM id.IDMP
    where (idm_address1 <> '' or idm_address2 <> '' 
    or idm_address_city <> '' or idm_zip_first_5 <> '')  
    and IDM_IDM_NO <> '        1'  
    order by idm_idm_no
    OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    allCAAddrCLT: (offset:number) => `SELECT *, 'CA' as LOCATION FROM ca.CLTP
    where (clt_address1 <> '' or clt_address2 <> '' 
    or clt_city_st_zip <> '') and clt_number > '' and substring(clt_number,10,1) <> ' '
    order by clt_number, clt_clt_seq_no
    OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    allDTAddrCLT: (offset:number) => `SELECT *, 'DT' as LOCATION FROM dt.CLTP
    where (clt_address1 <> '' or clt_address2 <> '' 
    or clt_city_st_zip <> '') and clt_number > '' and substring(clt_number,10,1) <> ' '
    order by clt_number, clt_clt_seq_no
    OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    allDTNameCLT: (offset:number) => `
    select *, 'DT' as LOCATION from dt.cltp where
    clt_number > '' and clt_name <> 'EX PARTE' and substring(clt_number,10,1) <> ' '
    order by clt_number, clt_clt_seq_no Offset ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    allCANameCLT: (offset:number) => `
    select *, 'CA' as LOCATION from ca.cltp where
    clt_number > '' and clt_name <> 'EX PARTE' and substring(clt_number,10,1) <> ' '
    order by clt_number, clt_clt_seq_no Offset ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    allCAPhoneCLT: (offset:number) => `
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag,
    PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id) select 
    concat('CA-', trim(clt_number), '-', clt_clt_seq_no), 
    concat(CLT_PHONE1, '-', CLT_PHONE2, '-', CLT_PHONE3),
    'Y', 'MAIN', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from ca.cltp where (CLT_PHONE2 <> '' or  CLT_PHONE3 <> '')
    and clt_number > '' and clt_name <> 'EX PARTE' and substring(clt_number,10,1) <> ' ';`,

    allDTPhoneCLT: (offset:number) => `
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag,
    PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id) select 
    concat('DT-', trim(clt_number), '-', clt_clt_seq_no), 
    concat(CLT_PHONE1, '-', CLT_PHONE2, '-', CLT_PHONE3),
    'Y', 'MAIN', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from dt.cltp where (CLT_PHONE2 <> '' or  CLT_PHONE3 <> '')
    and clt_number > '' and clt_name <> 'EX PARTE' and substring(clt_number,10,1) <> ' ';`,

    idaAll: (offset:number) => `SELECT * FROM id.IDAP
    join id.idmp on ida_idm_no = idm_idm_no where ida_idm_no <> '' and ida_alias <> ''
    and ida_seq <> 0 order by ida_idm_no, ida_alias   
    OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    atyAll: (offset:number) => `SELECT * FROM dt.atyp WHERE aty_bar_no <> '       1' 
    ORDER BY ATY_BAR_NO OFFSET ${offset} ROWS FETCH NEXT ${this.limit} ROWS ONLY;`,

    removeDupIDA: (offset:number) => `with tempida (duplicateRecCount, ida_idm_no, ida_alias) as (
    select ROW_NUMBER() over(PARTITION BY ida_idm_no, ida_alias 
    order by ida_idm_no, ida_alias) as duplicateRecCount, 
    ida_idm_no, ida_alias as duplicates from id.idap)
    delete from tempida WHERE duplicateRecCount > 1;`,

    removeDupIDL: (offset:number) => `with tempidl (duplicateRecCount, idl_idm_no, idl_dl_number) as (
    select ROW_NUMBER() over(PARTITION BY idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest) 
    order by idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest)) as duplicateRecCount, 
    idl_idm_no, concat(idl_dl_number_key, idl_dl_number_rest) as duplicates from id.idlp)
    delete from tempidl WHERE duplicateRecCount > 1;`,

    idm2DL: (offset:number) =>`insert into DCT_Person_DriversLicenses_Staging
    (spn, license_num, license_class_code, license_state, license_expiration_date, 
    date_time_created, date_time_modified, user_id) 
    select trim(idl_idm_no), concat(idl_dl_number_key, idl_dl_number_rest), idl_dl_type, idl_dl_state,
    case 
    when isdate(concat(idl_dl_expire_cc, idl_dl_expire_yy, '-', idl_dl_expire_mm, '-', idl_dl_expire_dd)) = 1
        then cast(concat(idl_dl_expire_cc, idl_dl_expire_yy, '-', idl_dl_expire_mm, '-', idl_dl_expire_dd) as date)
    end as license_expiration_date, 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from id.idlp 
    join id.idmp on trim(idl_idm_no) = trim(IDM_IDM_NO)
    where concat(idl_dl_number_key, idl_dl_number_rest) <> '';`,

    idm2PhoneMain: (offset:number) =>`
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag,
    PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id )
    select trim(idm_idm_no), 
    concat(IDM_PHONE1, '-', IDM_PHONE2, '-', IDM_PHONE3),
    'Y', 'MAIN', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from id.idmp where IDM_PHONE2 <> '' or  IDM_PHONE3 <> '';
    `,

    idm2PhoneCell: (offset:number) =>`
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag,
    PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id )
    select trim(idm_idm_no), 
    concat(IDM_CELL1, '-', IDM_CELL2, '-', IDM_CELL3),
    'Y', 'CELL', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from id.idmp where IDM_CELL2 <> '' or  IDM_CELL3 <> '';
    `,

    idm2PhoneFax: (offset:number) =>`
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag,
    PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id )
    select trim(idm_idm_no), 
    concat(IDM_FAX1, '-', IDM_FAX2, '-', IDM_FAX3),
    'Y', 'FAX', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from id.idmp where IDM_FAX2 <> '' or  IDM_FAX3 <> '';
    `,

    idv2Vehicle: (offset:number) =>`
    insert into DCT_Persons_VehicleInfo_Staging (
    spn, VEHICLE_MODEL_YEAR, VEHICLE_MAKE_TYPE_CODE, VEHICLE_MODEL_TYPE_CODE,
    LICENSE_PLATE_NUM, STATE_CODE, VEHICLE_COLOR, DATE_TIME_CREATED,
    DATE_TIME_MODIFIED, USER_ID)
    select trim(idv_idm_no), concat(idv_year_cc, idv_year_yy),
    left(idv_make,8), left(idv_model,8), idv_license, idv_license_state,
    idv_color, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from id.idvp join id.idmp on IDV_IDM_NO = IDM_IDM_NO;
    `,

    idm2demogr: (offset:number) =>`insert into dbo.DCT_Person_Demographics_History (
    SPN, DOB, Height, weight, sex, ETHINICITYTYPCD, eyecolor, haircolor, race_cd) select 
    trim(idm_idm_no), 
    case 
    when isdate(concat(idm_dob_yy, '-', idm_dob_mm, '-', idm_dob_dd)) = 1
        then cast(concat(idm_dob_yy, '-', idm_dob_mm, '-', idm_dob_dd) as date)
    end as dob, 
    (idm_height_ft * 12) + idm_height_in, idm_weight, idm_sex, idm_ethnic, idm_eyes, idm_hair, idm_race
    from id.idmp
    where idm_dob_yy <> '' or idm_dob_mm <> '' or idm_dob_dd <> ''
    or idm_height_ft > 0 or idm_height_in > 0 or idm_weight > 0 or idm_sex <> ''
    or idm_ethnic <> '' or idm_eyes <> '' or idm_hair <> '' or idm_race <> '';`,

    aty2email: (offset:number) =>`
    insert into DCT_Person_Email_Staging
    (SPN, EMAIL_ADDRESS, CURRENT_FLAG, EMAIL_TYP, DATE_TIME_CREATED, DATE_TIME_MODIFIED, USER_ID)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    aty_email_address, 
    case when aty_inactive_sw = 'Y' then 'N' else 'Y' end as Current_Flag,
    'email' as email_typ, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
    'bwilder' as user_id from dt.atyp where ATY_EMAIL_ADDRESS <> '';`,

    aty2phoneMain: (offset:number) =>`
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag, PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    concat(ATY_PHONE1, '-', ATY_PHONE2, '-', ATY_PHONE3), 
    'Y', 'MAIN', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder' 
    from dt.atyp where trim(ATY_BAR_NO) <> '1' and (ATY_PHONE2 <> '' or  ATY_PHONE3 <> '');
    `,

    aty2phoneFax: (offset:number) =>`
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag, PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    concat(ATY_FAX_PHONE1, '-', ATY_FAX_PHONE2, '-', ATY_FAX_PHONE3), 
    'Y', 'FAX', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from dt.atyp where trim(ATY_BAR_NO) <> '1' and (ATY_FAX_PHONE2 <> '' or  ATY_FAX_PHONE3 <> '');    
    `,

    aty2phoneCel: (offset:number) => `
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag, PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    concat(ATY_CEL_PHONE1, '-', ATY_CEL_PHONE2, '-', ATY_CEL_PHONE3),
    'Y', 'CELL', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from dt.atyp where trim(ATY_BAR_NO) <> '1' and (ATY_CEL_PHONE2 <> '' or  ATY_CEL_PHONE3 <> '');    
    `,

    aty2phoneBep: (offset:number) => `
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag, PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    concat(ATY_BEP_PHONE1, '-', ATY_BEP_PHONE2, '-', ATY_BEP_PHONE3),
    'Y', 'PAG', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from dt.atyp where trim(ATY_BAR_NO) <> '1' and (ATY_BEP_PHONE2 <> '' or  ATY_BEP_PHONE3 <> '');
    `,

    aty2phonePag: (offset:number) => `
    insert into dct_phones_staging
    (spn, BASEPHONENUM, CURRENTPHONEFLAG, PHONETYP, ProcessedFlag, PHONESEQ, DATE_TIME_CREATED, DATE_TIME_MODIFIED, user_id)
    select case when SUBSTRING(aty_bar_no,1,3) <> 'BND' then concat('ATY_', trim(aty_bar_no))
    else trim(aty_bar_no) end as SPN,
    concat(ATY_PAG_PHONE1, '-', ATY_PAG_PHONE2, '-', ATY_PAG_PHONE3),
    'Y', 'PAG', 'Y', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'bwilder'
    from dt.atyp where trim(ATY_BAR_NO) <> '1' and (ATY_PAG_PHONE2 <> '' or  ATY_PAG_PHONE3 <> '');    
    `,

    fixSuffix: (offset:number) => `
    update DCT_Persons_Staging set SUFFIX_NAME = replace(middlename, '.', ''), middlename = ''
    where middlename in ('JR', 'JR.', 'SR', 'SR.', 'II', 'II.', 'III', 
    'III.', 'IV', 'IV.', 'ESQ', 'ESQ.') and SUFFIX_NAME = ''`
  }

  async *execute(offset = this.offset): AsyncIterableIterator<Array<Partial<any>>> {
    let rows = [];
    let running = true;

    if (typeof this.table === "undefined")
      throw "No table defined";

    const statementFn = this.statements[this.table];


    while (running) {
      const statementComponenets = statementFn(offset).split(";");
      let query;
      if (statementComponenets.length > 2) {
        statementComponenets.pop();
        query = statementComponenets.pop();
        await Promise.all([statementComponenets.map(c => this.query(c))])
          .catch(err => {
            console.error(err);
            process.abort();
          })
      } else {
        query = statementComponenets[0];
      }
      // console.log(query)
      rows = await this.query(query)
        .catch(err => { console.error(err); running = false; rows = [] })

      // console.log(query, rows.length)
      if (rows && rows.length !== 0) {
        yield rows;
      } else {
        // console.log("done")
        running = false;
      }
      offset += this.limit;
    }
    // const data = this.query(query)
    // return data;
  }

  query = (query: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      sql.query(this.connectString, query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows)
        }
      })
    })
  }
}

interface ImportHandlerProps {
  limit?: number;
  offset?: number;
  table?: string;
}
