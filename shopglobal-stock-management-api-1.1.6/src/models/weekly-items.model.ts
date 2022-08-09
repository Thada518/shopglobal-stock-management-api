import OracleDB from 'oracledb';

class WeeklyItemsModel {
  public oracleDbClient: OracleDB.Connection;

  constructor(client: OracleDB.Connection) {
    this.oracleDbClient = client;
  }

  public getSaleGoodIdsByDate = async (date: string, weeklyNumber: number): Promise<any> => {
    const tableName = 'TB_AB070';
    const sql = `SELECT * FROM ${tableName} WHERE TRGT_MONTH = TO_DATE(:d, 'YYYYMMDD') AND WEEK_NUM = :weeklynumber`;
    const result = await this.oracleDbClient.execute(sql, { d: date, weeklyNumber }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    return result;
  };

  public getSSVProductByDate = async (date: string, weeklyNumber: number): Promise<any> => {
    const sql = `SELECT * FROM
    (
    SELECT a.seq                                                                    seq                , -- SEQ
           (SELECT v.clss_nm
              FROM tb_az001 v
             WHERE v.lclss_id = c.sale_lclss_id
               AND v.mclss_id = 0
               AND v.sclss_id = 0         )                                         lclss_nm           , -- SHOP L-Class
           (SELECT v.clss_nm
              FROM tb_az001 v
             WHERE v.lclss_id = c.sale_lclss_id
               AND v.mclss_id = c.sale_mclss_id
               AND v.sclss_id = 0         )                                         mclss_nm           , -- SHOP M-Class
           (SELECT v.clss_nm
              FROM tb_az001 v
             WHERE v.lclss_id = c.sale_lclss_id
               AND v.mclss_id = c.sale_mclss_id
               AND v.sclss_id = c.sale_sclss_id)                                    sclss_nm           , -- SHOP S-Class
           a.wil_s1_cd                                                              wil_s1_cd          , -- S1
           a.wil_s2_cd                                                              wil_s2_cd          , -- S2
           a.sale_good_id                                                           sale_good_id       , -- SHOP #
           c.sale_good_nm                                                           sale_good_nm       , -- SHOP NM
           c.set_yn                                                                 set_yn             , -- SET
           a.wil_prc_cd                                                             wil_prc_cd         , -- PRC Style
           SF_GET_SALE_PRC_MINUS_VAT_V02(A.SALE_GOOD_ID,
                                         C.PRC,
                                         TO_DATE(:as_std_date, 'YYYYMMDD'))         prc_minus_vat      , -- PRC (ex VAT)
           a.brd_event_prc                                                          rqst_promo_prc     , -- RQST PROMO PRC (ex VAT)
           TO_CHAR(a.brd_fr_date , 'yyyy-mon-dd', 'NLS_DATE_LANGUAGE=AMERICAN')     rqst_fr_sale_term  , -- RQST SSV/Sale term (from)
           TO_CHAR(a.brd_end_date, 'yyyy-mon-dd', 'NLS_DATE_LANGUAGE=AMERICAN')     rqst_end_sale_term , -- RQST SSV/Sale term (to)
           NVL(SF_GET_ACTUAL_COST( '00'
                                 , B.SALE_GOOD_ID
                                 , 0
                                 , 0
                                 , '00000000'    ), 0)                              last_cost_minus_vat, -- COST (ex VAT)
           NULL                                                                     promo_prc          , -- PROMO PRC (ex VAT)    * DC Event Promotion Data
           NULL                                                                     promo_dc_rate      , -- DC%(ex VAT)           * DC Event Promotion Data
           NULL                                                                     promo_dc_amt       , -- DC Amt (ex VAT)       * DC Event Promotion Data
           NULL                                                                     promo_dc_vat       , -- DC Amt (inc VAT)      * DC Event Promotion Data
           NULL                                                                     promo_fr_date      , -- Promotion term (from) * DC Event Promotion Data
           NULL                                                                     promo_end_date     , -- Promotion term (to)   * DC Event Promotion Data
           a.brd_sale_schd_qty                                                      sale_qty           , -- Sales QTY
           CASE  WHEN (a.brd_schd_time is null) THEN 0
                           ELSE  a.brd_schd_time  END                               air_time           , -- Air Time (min)
           g.title_nm                                                               title_nm           , -- BRD Program
           b.sale_sku_id                                                            sale_sku_id        , -- SHOP SKU#
           b.sell_color_desc                                                        sell_color_nm      , -- Selling Color
           b.sell_style_desc                                                        sell_style_nm      , -- Selling Style
           NVL((CASE WHEN SF_GET_SALE_ITEM_INFO('DLV_CD', C.SALE_GOOD_ID) = '10' THEN 0
                     ELSE SF_GET_SALE_STOCK_QTY( B.SALE_GOOD_ID
                                               , B.SALE_COLOR_ID
                                               , B.SALE_STYLE_ID
                                               , 'ALL')
                 END), 0)                                                           stock_qty          ,
           SF_GET_SALE_STOCK_IN_SCHD_QTY( B.SALE_GOOD_ID
                                        , B.SALE_COLOR_ID
                                        , B.SALE_STYLE_ID )                         stock_in_schd_qty  , -- Stock-in SCHD QTY
           NVL(sf_ord_poss_qty_by_so( B.SALE_GOOD_ID
                                    , B.SALE_COLOR_ID
                                    , B.SALE_STYLE_ID
                                    , 0               ), 0)                         ord_poss_qty       , -- ORD POSS QTY
           1 + ROUND(SF_GET_SALE_TAX_RATE(C.PRC_TAX_RATE_CD
                                         ,TO_DATE(:as_std_date
                                                 ,'YYYYMMDD')) / 100, 2)            prc_tax_rate_cd    , -- Item Price Tax Rate
           a.trgt_month                                                             trgt_month         ,
           initcap(to_char(a.trgt_month, 'month', 'NLS_DATE_LANGUAGE=AMERICAN'))    month_nm           ,
           a.week_num                                                               week_num           ,
           b.color_id                                                               color_id           ,
           b.style_id                                                               style_id           ,
           c.good_invo_nm || ' ' || c.good_style_invo_nm                            receipt_nm         ,
           sf_get_code_nm('WIL_S1_CD' , a.wil_s1_cd )                               wil_s1_nm          ,
           sf_get_code_nm('WIL_S2_CD' , a.wil_s2_cd )                               wil_s2_nm          ,
           sf_get_code_nm('WIL_PRC_CD', a.wil_prc_cd)                               wil_prc_nm         ,
           TO_CHAR(a.brd_fr_date , 'dd-mon-yyyy')                                   rqst_fr_sale       , -- RQST SSV/Sale term (from)
           TO_CHAR(a.brd_end_date, 'dd-mon-yyyy')                                   rqst_end_sale      ,
           a.brd_grp_id                                                             brd_grp_id         ,
           a.title_id                                                               title_id           ,
           COUNT(*) OVER(PARTITION BY  a.trgt_month,
                                       a.week_num,
                                       a.brd_grp_id,
                                       a.title_id,
                                       a.sale_good_id
                              ORDER BY a.trgt_month,
                                       a.week_num,
                                       a.brd_grp_id,
                                       a.title_id,
                                       a.sale_good_id)                              grp_cnt            ,
           row_number() OVER(PARTITION BY a.trgt_month,
                                          a.week_num,
                                          a.brd_grp_id,
                                          a.title_id,
                                          a.sale_good_id
                                 ORDER BY a.trgt_month,
                                          a.week_num,
                                          a.brd_grp_id,
                                          a.title_id,
                                          b.sale_sku_id)                            part_cnt
      FROM tb_ab070 a
         , tb_ag071 c
         , tb_ag072 b
         , tb_ab020 f
         , tb_ab001 g
     WHERE a.sale_good_id    = b.sale_good_id
       AND a.sale_good_id    = c.sale_good_id
       AND b.sale_yn         = 'Y'
       AND a.brd_grp_id      = f.brd_grp_id
       AND a.title_id        = g.title_id
      ORDER BY a.trgt_month, a.week_num, a.brd_grp_id, a.title_id, a.seq, b.sku_id
    )
      WHERE trgt_month      = TRUNC(TO_DATE(:as_trgt_month, 'YYYYMMDD'), 'MM')
        AND week_num        = :al_week_num
        AND ((:as_lclss_nm  =  'Overall' AND lclss_nm = lclss_nm)
         OR  (:as_lclss_nm  <> 'Overall' AND lclss_nm like  '%' || :as_lclss_nm || '%'))
      ORDER BY trgt_month,   week_num,   brd_grp_id,   title_id,   seq,   sale_sku_id`;
    const result = await this.oracleDbClient.execute(sql, {
      as_trgt_month: date,
      as_std_date: date,
      al_week_num: weeklyNumber,
      as_lclss_nm: 'Overall',
    });
    return result;
  };

  public getSaleSkuIdBySaleGoodId = async (saleGoodId: number): Promise<any> => {
    const tableName = 'TB_AG072';
    const sql = `SELECT * FROM ${tableName} WHERE SALE_GOOD_ID = :s`;
    const result = await this.oracleDbClient.execute(sql, { s: saleGoodId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    return result;
  };

  public getProductDetailBySaleGoodId = async (saleGoodId: number): Promise<any> => {
    const itemInfoTable = 'TB_AG073';
    const itemInfoSql = `SELECT * FROM ${itemInfoTable} WHERE SALE_GOOD_ID = :s`;
    const itemInfo = await this.oracleDbClient.execute(itemInfoSql, { s: saleGoodId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    return itemInfo;
  };

  public getCategoryDetailBySalesGoodId = async (saleGoodId: number): Promise<any> => {
    const productTableName = 'TB_AG071';
    const sqlClass = `SELECT SALE_LCLSS_ID, SALE_MCLSS_ID, SALE_SCLSS_ID, SALE_GOOD_APPR_CD FROM ${productTableName} WHERE SALE_GOOD_ID = :s`;
    const productClass = await this.oracleDbClient.execute(sqlClass, { s: saleGoodId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    const classProduct = productClass.rows?.[0] ?? {};
    if (classProduct?.['SALE_LCLSS_ID']) {
      const sqlCategoryTable = 'TB_AZ001';
      const sqlCategory = `SELECT CLSS_NM FROM ${sqlCategoryTable} WHERE LCLSS_ID = :l AND MCLSS_ID = :m AND SCLSS_ID = :s`;
      const categories = await this.oracleDbClient.execute(
        sqlCategory,
        {
          l: classProduct['SALE_LCLSS_ID'],
          m: classProduct['SALE_MCLSS_ID'],
          s: classProduct['SALE_SCLSS_ID'],
        },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT },
      );
      return { row: categories?.rows, lastApprove: classProduct['SALE_GOOD_APPR_CD'] } ?? null;
    }
  };
  public getStockQtyByItemSaleGoodId = async (saleGoodId: number) => {
    const sql = `select distinct
    g71.sale_good_id                     sale_good_id,
    substr(g72.sale_sku_id,7,3) sub_shop,
    ecl.EC_CLSS_NM_ETC EC_LCLASS,
    ecm.EC_CLSS_NM_ETC EC_MCLASS,
    ecs.EC_CLSS_NM_ETC EC_SCLASS,
    mat.EC_CLSS_NM_ETC EC_MAT,
    z13.brand_nm_eng brand,
    g71.sale_good_nm                     sale_good_nm,
    g72.sell_color_desc,
    g72.sell_style_desc,
 --   sum(L24.Stock_Qty) ORD_POSS_QTY,
  SF_ORD_POSS_QTY_V02( G72.SALE_GOOD_ID
                , G72.SALE_COLOR_ID
                , G72.SALE_STYLE_ID
                , G2.SITE_NO )     AS ORD_POSS_QTY,
    g71.prc,
    0 dc_prc,--g14.dc_prc,
    'None' promo_title,--g14.dc_prc_desc promo_title,
    '--' fr_date,--g6.fr_date,
    '--' end_date,--g6.end_date,
    g73.cg_send_info3 graphic,
    usage_desc fact1,
    func_desc fact2,
    g73.property_desc fact3
  --  g73.cg_send_info4 callout

from tb_ag071 g71 , TB_AG072 g72 ,TB_AZ001 cl , tb_az013 z13 , tb_ag073 g73 ,  TB_AG002 g2 ,
    (SELECT EC_LCLSS_ID, EC_CLSS_NM_ENG, EC_CLSS_NM_ETC FROM TB_AZ030 WHERE (EC_MCLSS_ID = 0 AND EC_SCLSS_ID = 0)) ECL,
    (SELECT EC_LCLSS_ID, EC_MCLSS_ID, EC_CLSS_NM_ENG, EC_CLSS_NM_ETC FROM TB_AZ030 WHERE (EC_MCLSS_ID <> 0 AND EC_SCLSS_ID = 0)) ECM,
    (SELECT EC_LCLSS_ID, EC_MCLSS_ID, EC_SCLSS_ID, EC_CLSS_NM_ENG, EC_CLSS_NM_ETC FROM TB_AZ030 WHERE ( EC_SCLSS_ID <> 0 )) ECS,
    (SELECT EC_LCLSS_ID, EC_MAT_CLSS_ID, EC_CLSS_NM_ETC FROM TB_AZ031) mat
where g71.sale_good_id = g73.sale_good_id(+)
and   g71.sale_good_id = g72.sale_good_id
and   g71.sale_lclss_id = cl.lclss_id
and   cl.mclss_id = '0'
and   cl.sclss_id = '0'
and   g71.brand_id = z13.brand_id
and   G72.Good_Id = g2.Good_Id
And   G72.Color_Id = g2.Color_Id
And   G72.Style_Id = g2.Style_Id
-- and   g14.vl_yn = 'Y'
-- and   l24.site_no in ('B1N')
and   g71.ec_lclss_id = ecl.EC_LCLSS_ID
and   (g71.ec_lclss_id = ecm.EC_LCLSS_ID and g71.ec_mclss_id = ecm.EC_MCLSS_ID)
and   (g71.ec_lclss_id = ecs.EC_LCLSS_ID and g71.ec_mclss_id = ecs.EC_MCLSS_ID and g71.ec_sclss_id = ecs.EC_SCLSS_ID)
and   (g71.ec_lclss_id = mat.EC_LCLSS_ID(+) and g71.ec_mat_clss_id = mat.EC_MAT_CLSS_ID(+))
--and   g6.end_date >= sysdate
--and   l24.stock_qty <> 0
-- and   LOC_CD = '00'
-- and   g71.sale_lclss_id = 5
and   g71.sale_good_id = :s

and   G2.SITE_NO not in ('L1' , 'S1' , 'R1')
order by 1,2`;

    const result = await this.oracleDbClient.execute(sql, { s: saleGoodId }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    return result?.rows ?? null;
  };

  public getWarehouseLocationBySaleGoodStyleAndColor = async (saleGoodId: number, styleId: number, colorId: number): Promise<any> => {
    const tableName = 'TB_AG002';
    const sql = `SELECT SITE_NO FROM ${tableName} WHERE GOOD_ID = :g AND COLOR_ID = :c AND STYLE_ID = :s`;
    const result = await this.oracleDbClient.execute(
      sql,
      { g: Number(`500${saleGoodId}`), c: colorId, s: styleId },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT },
    );
    return result?.rows.filter(s => s['SITE_NO'] !== 'H01' && s['SITE_NO'] !== 'L1' && s['SITE_NO'] !== 'R1' && s['SITE_NO'] !== 'S1') ?? [];
  };

  public getDiscountPriceBySaleGoodId = async (saleGoodId: number): Promise<any> => {
    const tableName = 'TB_AG014';
    const sql = `SELECT * FROM ${tableName} WHERE SALE_GOOD_ID = :s ORDER BY EVENT_ID DESC`;
    const result = await this.oracleDbClient.execute(
      sql,
      {
        s: Number(saleGoodId),
      },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT },
    );
    return result?.rows;
  };

  public getPromotionDetailsByEventId = async (eventId: number): Promise<any> => {
    const tableName = 'TB_AG006';
    const sql = `SELECT * FROM ${tableName} WHERE EVENT_ID = :eventId AND ROWNUM <= :n`;
    const result = await this.oracleDbClient.execute(sql, { eventId: eventId, n: 1 }, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
    return result?.rows;
  };
}

export default WeeklyItemsModel;
