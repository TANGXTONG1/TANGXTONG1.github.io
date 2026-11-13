# EveryInfra 公开能力目录：真实响应，但不是业务样本

本次匿名 GET https://api.everyinfra.com/api/v1/social/catalog 取得 HTTP 200。原始响应与验证记录已保留。它是能力/字段/参数/价格的元数据，不含真实商品订单或评价业务响应；不计为鉴权业务 API 成功，也不据此将供应商列为采购精选。

目录没有 pdd/pinduoduo 或 meituan，temu 不等于国内拼多多。实际可调用性仍需要账户、权限和样本验收。

统一入口并未消除平台差异：

| 业务含义 | 淘宝 | 京东 | 抖音 |
| --- | --- | --- | --- |
| 商品主键 | id | item_id | product_id |
| 价格 | price + currency；部分换算限制 | price + currency；可能遮蔽/缺失 | price_cny / price_cny_minor |
| 销量 | sold_count / sold_text | search 的 sold_count | monthly_sales / sales_text / sold_count |
| 评论 | reviews 的 text / rating / posted_at | reviews 的 text / rating / posted_at | 社媒评论不是购后评价；不能自动混用 |

供应商如能统一交付，应在合同与接口文档中定义时间窗、金额单位、销量来源与估算标志、分页上限、缺失状态、平台 ID，以及评价与内容评论的区别。