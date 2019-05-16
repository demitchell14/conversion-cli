export interface IRowData {
  spn: string;
  firstname: string;
  middlename: string;
  lastname: string;
  displayname: string;
  corp: string;
  sealedflag: string;
  suffix_name: string;
  comment_text: string;
  date_time_created: string;
  date_time_modified: string;
  user_id: string;
  count?: number
}

export interface IIDMRowData {
  IDM_IDM_NO: string;
  IDM_IN_USE_ID: string
  IDM_IN_USE_USR: string
  IDM_IN_USE_ACT: string
  IDM_NAME: string
  IDM_ADDRESS1: string
  IDM_ADDRESS2: string
  IDM_ADDRESS_CITY: string
  IDM_ADDRESS_STATE: string
  IDM_ZIP_FIRST_5: string
  IDM_ZIP_LAST_4: string
  IDM_PHONE1: string;
  IDM_PHONE2: string;
  IDM_PHONE3: string;
  IDM_DL_NUMBER_KEY: string;
  IDM_DL_NUMBER_REST: string;
  IDM_DL_STATE: string;
  IDM_DL_TYPE: string;
  IDM_DL_EXPIRE_YY: string;
  IDM_DL_EXPIRE_MM: string;
  IDM_DL_EXPIRE_DD: string;
  IDM_SOC_SEC_NO1: string;
  IDM_SOC_SEC_NO2: string;
  IDM_SOC_SEC_NO3: string;
  IDM_ID_NUMBER_KEY: string;
  IDM_ID_NUMBER_REST: string;
  IDM_ID_STATE: string;
  IDM_MISC_NUMBER: string;
  IDM_MISC_AGENCY: string;
  IDM_SO_NO: string;
  IDM_SID_NO: string;
  IDM_TDC_NO: string;
  IDM_FBI_NO: string;
  IDM_DPS_SID_SW: string;
  IDM_DOB_MM: string;
  IDM_DOB_DD: string;
  IDM_DOB_YY: string;
  IDM_POB: string;
  IDM_RACE: string;
  IDM_ETHNIC: string;
  IDM_SEX: string;
  IDM_HEIGHT_FT: string;
  IDM_HEIGHT_IN: string;
  IDM_WEIGHT: string;
  IDM_HAIR: string;
  IDM_EYES: string;
  IDM_SKIN: string;
  IDM_CITIZENSHIP: string;
  IDM_LAST_OPER: string;
  IDM_LAST_DATE_MM: string;
  IDM_LAST_DATE_DD: string;
  IDM_LAST_DATE_YR: string;
  IDM_LAST_APP: string;
  IDM_PRINT_NO: string;
  IDM_BAD_ADDRESS_SW: string;
  IDM_REMARKS: string;
  IDM_CARRIES_WEAPON: string;
  IDM_CELL1: string;
  IDM_CELL2: string;
  IDM_CELL3: string;
  IDM_FAX1: string;
  IDM_FAX2: string;
  IDM_FAX3: string;
  IDM_MARITAL_STATUS: string;
  IDM_GANG: string;
  IDM_DECEASED: string;
  IDM_LAST_TIME: string;
}

export interface IIDARowData {
  IDA_IDM_NO: string;
  IDA_SEQ: string;
  IDA_ALIAS: string;
  IDA_REPORT_CC: string;
  IDA_REPORT_YY: string;
  IDA_REPORT_MM: string;
  IDA_REPORT_DD: string;
  FILLER001: string;
}

export declare namespace DT {

  interface ATYP {
    ATY_BAR_NO: string;
    ATY_NAME: string;
    ATY_ADDRESS1: string;
    ATY_ADDRESS2: string;
    ATY_CITY_ST_ZIP: string
    ATY_PHONE1: string
    ATY_PHONE2: string
    ATY_PHONE3: string
    ATY_FIRM: string
    ATY_BOND_LIABILITY: string
    ATY_BOND_LIMIT: string
    ATY_FAX_PHONE1: string
    ATY_FAX_PHONE2: string
    ATY_FAX_PHONE3: string
    ATY_UN_1_FROM_YY: string
    ATY_UN_1_FROM_MM: string
    ATY_UN_1_FROM_DD: string
    ATY_UN_1_TO_yy: string
    ATY_UN_1_TO_MM: string
    ATY_UN_1_TO_DD: string
    ATY_UN_2_FROM_YY: string
    ATY_UN_2_FROM_MM: string
    ATY_UN_2_FROM_DD: string
    ATY_UN_2_TO_YY: string
    ATY_UN_2_TO_MM: string
    ATY_UN_2_TO_DD: string
    ATY_FORM_NAME: string
    ATY_CEL_PHONE1: string
    ATY_CEL_PHONE2: string
    ATY_CEL_PHONE3: string
    ATY_BEP_PHONE1: string
    ATY_BEP_PHONE2: string
    ATY_BEP_PHONE3: string
    ATY_PAG_PHONE1: string
    ATY_PAG_PHONE2: string
    ATY_PAG_PHONE3: string
    ATY_UN_3_FROM_YY: string
    ATY_UN_3_FROM_MM: string
    ATY_UN_3_FROM_DD: string
    ATY_UN_3_TO_YY: string
    ATY_UN_3_TO_MM: string
    ATY_UN_3_TO_DD: string
    ATY_UN_4_FROM_YY: string
    ATY_UN_4_FROM_MM: string
    ATY_UN_4_FROM_DD: string
    ATY_UN_4_TO_YY: string
    ATY_UN_4_TO_MM: string
    ATY_UN_4_TO_DD: string
    ATY_UN_S_FROM_YY: string
    ATY_UN_S_FROM_MM: string
    ATY_UN_S_FROM_DD: string
    ATY_UN_S_TO_YY: string
    ATY_UN_S_TO_MM: string
    ATY_UN_S_TO_DD: string
    ATY_CHG_YY: string
    ATY_CHG_MM: string
    ATY_CHG_DD: string
    ATY_CHG_BY: string
    ATY_CHG_APP: string
    ATY_INACTIVE_SW: string
    ATY_EMAIL_ADDRESS: string
  }

}

export declare namespace STAGING {
  interface DCT_PERSONS_STAGING {
    spn: string;
    firstname: string;
    middlename: string;
    lastname: string;
    displayname: string;
    corp: string;
    sealedflag: string;
    is_attorney: string;
    suffix_name: string;
    comment_text: string;
    date_time_created: string;
    date_time_modified: string;
    user_id: string;
  }

  interface DCT_ADDRESSESS_STAGING {
    SPN: string,
    ADDRESSTYP: string,
    PostedDate: string,
    CurrentAddressFlag: string,
    BadAddressFlag: string,
    Addressline1: string
    Addressline2: string,
    state: string,
    city: string,
    postalCD: string,
    RestrictedAddressFlag: string,
    PrimaryFlag: string,
    ProcessedFlag: string,
    AddressSeq: string|number,
    Date_time_created: string
    date_time_modified: string,
    user_id: string,
  }
}
