# EveryInfra 与 Qovia 试用及报价对比

核验于 2026-11-06。所有价格为 USD 公开标准价，不含充值手续费、账户折扣或企业报价。以商品买家评价为主，内容互动评论单列。

**两家已取得真实评论响应，但都尚不能覆盖淘京拼美的统一采购目标：淘宝本次未通过，拼多多、美团/大众点评未核端点。京东两家均有样本；Qovia实测支持抖店评价，EveryInfra实测支持小红书商品评价。仍需验证目标商品批量成功率、历史深度和使用授权。**

官方目录、定价与条款，加2026-11-06少量鉴权API实测；未验证生产稳定性。 少量真实调用与分页抽样，不代表所有商品、全历史覆盖或长期稳定性。

## 试用申请与账户实测

- EveryInfra：注册、GitHub绑定及两个仓库点星均已完成，$1试用已到账；截至本次测试，15次业务请求（含5次搜索、1次界面调用）消耗约$0.060139，余$0.939861；赠送额于2026-11-07 15:08 UTC+8到期。
- Qovia：邮箱验证与注册已完成，50次试用已到账，已创建限定四个平台权限的Key；14次评论请求中9次成功非空。2026-11-06 17:00 UTC+8账户API确认剩41次、余额$0、60 RPM；试用额度到期时间仍未核。

EveryInfra：已领取$1试用金，到期时间为2026-11-07 15:08 UTC+8；本次累计扣减$0.060139，最后记录余额$0.93986111。

Qovia：初始50次试用；2026-11-06T09:00:01.569722+00:00账户快照显示剩余41次、60 RPM、现金余额$0。额度和速率是账户快照，不是每日重置或实际吞吐保证。

共记录29次业务请求：EveryInfra 15次（搜索5次、评论10次，含官方调试台界面调用1次）；Qovia 14次评论请求，其中9次成功非空、5次错误。账户查询不计入业务请求。

[下载脱敏真实试调 JSON](真实API试调记录-2026-11-06.json) · [Qovia 账户](https://qovia.ai/zh/account/) · [EveryInfra 账户](https://everyinfra.com/auth/logto/login)

公开文件仅保留每次返回的前两条脱敏摘录，正文最多40字，并列原文长度；密钥、邮箱、作者资料、图片URL及分页令牌未发布。完整原始响应保存在本机私有目录。

## 真实评论调用结果

返回条数包括重复和空正文；去重按各端点评论 ID 计算，不等于具有有效正文的评论数。重复率为重复 ID 数除以返回条数。不同平台及本次样本量不能用于推断整体成功率或生产 SLA。

| 供应商与接口 | 请求 / 非空请求 | 返回 / 去重条数 | 重复条数及比例 | 本样本最早日期 | 结果及分页观察 |
| --- | --- | --- | --- | --- | --- |
| EveryInfra 淘宝 / 天猫商品评价 | 3 / 0 | 0 / 0 | 无样本，无法计算 | 无返回日期 | 界面调用未独立取得HTTP状态 × 1；HTTP 200 × 2；3个商品，未取得非空评价；无分页元数据；未验证历史边界 |
| EveryInfra 京东商品评价 | 1 / 1 | 10 / 10 | 0（0.00%） | 2026-11-04 09:44:17 | HTTP 200 × 1；无分页元数据；未验证历史边界 |
| EveryInfra 小红书商品评价 | 2 / 2 | 40 / 40 | 0（0.00%） | 2025-11-06 | HTTP 200 × 2；第1次/页，has_more=true；第2次/页，has_more=true；本次未翻至停止页 |
| EveryInfra 抖音视频评论 | 2 / 2 | 27 / 27 | 0（0.00%） | 2026-09-20T13:40:18+00:00 | HTTP 200 × 2；第1次/页，has_more=true；第2次/页，has_more=true；本次未翻至停止页 |
| EveryInfra 小红书笔记评论 | 2 / 2 | 25 / 24 | 1（4.00%） | 2026-10-27T05:56:06+00:00 | HTTP 200 × 2；第1次/页，has_more=true；第2次/页，has_more=true；本次未翻至停止页 |
| Qovia 淘宝 / 天猫商品评价 V1 | 3 / 0 | 0 / 0 | 无样本，无法计算 | 无返回日期 | HTTP 503 × 3；2个商品，未取得非空评价；无分页元数据；未验证历史边界 |
| Qovia 小红书笔记评论 | 2 / 2 | 10 / 10 | 0（0.00%） | 2026-10-28T09:30:03+00:00 | HTTP 200 × 2；第1次/页，has_more=true，comment_count=278；第2次/页，has_more=true，comment_count=278；本次未翻至停止页 |
| Qovia 京东商品评价 | 3 / 3 | 30 / 30 | 0（0.00%） | 2026-11-02T13:00:29+08:00 | HTTP 200 × 3；第1次/页，has_more=true，max_page=2，total=1000；第2次/页，has_more=true，max_page=4，total=1000；第3次/页，has_more=true，max_page=6，total=1000；max_page动态变化，不能视为固定页数上限；本次未翻至停止页 |
| Qovia 抖音视频评论 | 2 / 2 | 37 / 29 | 8（21.62%） | 2026-09-20T21:40:18+08:00 | HTTP 200 × 2；第1次/页，has_more=true，total=447；第2次/页，has_more=true，total=447；本次未翻至停止页 |
| Qovia 抖音商品评价 | 2 / 2 | 32 / 32 | 0（0.00%） | 2026-07-06T09:14:04+08:00 | HTTP 200 × 2；采用官方文档商品实调；第1次/页，has_more=true，total=32；第2次/页，has_more=false，total=32；本样本收到停止指示，不代表所有商品历史深度 |
| Qovia 淘宝 / 天猫商品评价 V2 | 2 / 0 | 0 / 0 | 无样本，无法计算 | 无返回日期 | HTTP 502 × 2；1个商品，未取得非空评价；无分页元数据；未验证历史边界 |

日期仅表示本次抽样返回的最早时间，不是可取历史的起点或全量边界。数值时间戳换算为 UTC；原有文本未推断时区。分页字段和评价总数是响应元数据，不能替代实际返回条数。

### 字段出现与非空情况

下表按供应商分别列出各接口顶层字段。每项为“非空条数 / 字段出现条数”，分母基于全部返回记录，包含跨页重复；0 和 false 作为有效值。字段存在但为空不能算已取得内容，字段未出现也不能证明接口永久不支持。

#### EveryInfra

| 接口（返回条数） | 正文 | 时间 | 评分 | 图片 | SKU / 规格 | 商家回复 | 追评 / 子评论 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 淘宝 / 天猫商品评价（0） | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 |
| 京东商品评价（10） | text：10/10 | posted_at：10/10 | rating：10/10；rating_scale：10/10 | images：9/9 | color：10/10 | 本样本未出现 | 本样本未出现 |
| 小红书商品评价（40） | text：40/40 | posted_date：40/40 | rating：40/40；rating_scale：40/40；logistics_rating：40/40；service_rating：40/40 | images：40/40 | sku：40/40 | 本样本未出现 | 本样本未出现 |
| 抖音视频评论（27） | text：25/27 | posted_at：27/27 | 本样本未出现 | images：5/5 | 本样本未出现 | 本样本未出现 | 本样本未出现 |
| 小红书笔记评论（25） | text：25/25 | posted_at：25/25 | 本样本未出现 | images：0/25 | 本样本未出现 | 本样本未出现 | sub_comments：0/25 |

#### Qovia

| 接口（返回条数） | 正文 | 时间 | 评分 | 图片 | SKU / 规格 | 商家回复 | 追评 / 子评论 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 淘宝 / 天猫商品评价 V1（0） | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 |
| 小红书笔记评论（10） | content：10/10 | time：10/10 | 本样本未出现 | 本样本未出现 | 本样本未出现 | 本样本未出现 | sub_comments：4/10 |
| 京东商品评价（30） | text：30/30 | created_at：30/30 | rating：30/30 | images：27/30 | sku：30/30；sku_id：30/30 | shop_reply：3/30 | 本样本未出现 |
| 抖音视频评论（37） | text：34/37 | created_at：37/37 | 本样本未出现 | images：8/37 | 本样本未出现 | 本样本未出现 | 本样本未出现 |
| 抖音商品评价（32） | text：10/32 | created_at：32/32 | rating：32/32；ratings：32/32 | 本样本未出现 | sku：32/32 | shop_reply：30/32 | 本样本未出现 |
| 淘宝 / 天猫商品评价 V2（0） | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 | 无返回样本 |

color只是本次京东样本的规格字段，不能等同于完整SKU结构；ratings非空只确认返回了评分对象，未对其所有子字段逐一验收。子评论与购后追评含义不同；本次未验证完整追评链和完整楼中楼。默认好评文案不等于消费者主动撰写的正文。

### 去重后的样本成本

EveryInfra按响应中的实际赠送余额扣减记录；Qovia本次由免费次数抵扣，现金扣费为0，另以公开标准单次价格估算相同成功非空请求的付费成本。每千条为按本次样本去重数量换算，仍包含空正文，不能当作长期有效正文成本；搜索费用不计入下列评论接口单项。

| 供应商与接口 | 本次实际扣减 / 试用次数 | 按本次样本换算 |
| --- | --- | --- |
| EveryInfra 淘宝 / 天猫商品评价 | $0；试用次数扣减0 | 无非空评论样本，无法计算每条成本 |
| EveryInfra 京东商品评价 | $0.001389（赠送余额扣减） | 本次实际扣减折算$0.1389/千条去重评论 |
| EveryInfra 小红书商品评价 | $0.011111（赠送余额扣减） | 本次实际扣减折算$0.277775/千条去重评论 |
| EveryInfra 抖音视频评论 | $0.001111（赠送余额扣减） | 本次实际扣减折算$0.04114815/千条去重评论 |
| EveryInfra 小红书笔记评论 | $0.011111（赠送余额扣减） | 本次实际扣减折算$0.46295833/千条去重评论 |
| Qovia 淘宝 / 天猫商品评价 V1 | $0；试用次数扣减0 | 无非空评论样本，无法计算每条成本 |
| Qovia 小红书笔记评论 | $0；消耗试用2次 | 标准价估算$0.01；$1/千条去重评论 |
| Qovia 京东商品评价 | $0；消耗试用3次 | 标准价估算$0.0585；$1.95/千条去重评论 |
| Qovia 抖音视频评论 | $0；消耗试用2次 | 标准价估算$0.001；$0.03448276/千条去重评论 |
| Qovia 抖音商品评价 | $0；消耗试用2次 | 标准价估算$0.001；$0.03125/千条去重评论 |
| Qovia 淘宝 / 天猫商品评价 V2 | $0；试用次数扣减0 | 无非空评论样本，无法计算每条成本 |

## 重点评论报价与取数深度

价格表示每1000个计费单位，不是每1000条评论。每次请求、每页和每20条等单位应分别计算；空结果、重复评论和缺失字段都会影响有效评论成本。

| 平台及数据 | EveryInfra 价格、状态与范围 | Qovia 价格、状态与范围 |
| --- | --- | --- |
| 淘宝 / 天猫 V1：商品买家评价 | 已实调：3个商品均为空；$1.389 / 千个计费单位；每成功非空调用一次。文档单次上限100条，未声明分页。实测3个商品均返回0条，未扣费；不能据此判定全部淘宝商品不可用，也不能算验收通过。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=taobao) | 已实调：3次503；$13.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。文档每页20条，page参数≤500。实测2个商品共3次请求均为503 upstream_busy，未消耗试用；尚无成功评论样本，页数上限不代表全量。 [来源](https://qovia.ai/docs/api-reference/raw.taobao.comments/) |
| 淘宝 / 天猫 V2：商品买家评价原样JSON | 未核对应端点；未核报价；不适用。没有独立V2对照入口；标准reviews见上一行。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 已实调：2次502；$16.91 / 千次成功非空请求；一次成功非空请求，不是单条评论。文档每页20条，page参数≤500，与V1字段不同。同一商品间隔重试两次仍为502 origin_bad_gateway，未消耗试用；尚无成功评论样本。 [来源](https://qovia.ai/docs/api-reference/raw.taobao.comments_v2/) |
| 京东：商品买家评价 | 样本通过：10条；$1.389 / 千个计费单位；每成功非空调用一次。实测1个SKU返回10条（含1条未填写评价），约25.2秒，扣100 credits≈$0.001389。文档单次上限10条，未声明分页；不保证全量历史。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=jd) | 样本通过：3页30条；$19.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。同一SKU连续3页共30条，ID无重复；含1条默认评价。max_page先后为2/4/6，元数据动态变化，不能当固定两页上限。文档page≤100，实际历史极限未验。 [来源](https://qovia.ai/docs/api-reference/raw.jd.comments/) |
| 拼多多：商品 / 门店买家评价 | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://qovia.ai/openapi.json) |
| 美团：商品 / 门店买家评价 | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://qovia.ai/openapi.json) |
| 大众点评：商品 / 门店买家评价 | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 未核对应端点；未核报价；不适用。当前目录未核对应评论端点 [来源](https://qovia.ai/openapi.json) |
| 抖店 V1：商品买家评价 | 未核对应端点；未核报价；不适用。抖音目录有商品详情和视频评论，未核商品评价端点。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 样本通过：2页32条；$0.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。官方文档商品ID实调：20+12条、32个不同ID，但正文仅10条非空，评分/SKU均有值。第二页has_more=false；只证实该样本分页结束，不代表平台完整历史。 [来源](https://qovia.ai/docs/api-reference/raw.douyin.goods_comments/) |
| 抖店 V2：商品买家评价原样JSON | 未核对应端点；未核报价；不适用。未核商品评价端点。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 文档Live / Beta，未实调；$16.91 / 千次成功非空请求；一次成功非空请求，不是单条评论。每页20条；page参数≤500，HasMore=false停止；原样字段与V1不同。 [来源](https://qovia.ai/docs/api-reference/raw.douyin.goods_comments_v2/) |
| 抖音视频：内容互动评论 | 样本通过：2页27条；$0.556 / 千个计费单位；每20条为一个计费单位。同一视频2页18+9条、27个不同ID；每页实扣40 credits≈$0.000556，未返回的预扣单位已退。每20条一计费单位，page_token有效24小时；未到末页。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=douyin) | 样本通过，但跨页重复；$0.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。同一视频2页19+18条，共37条、29个不同ID，8条跨页重复；需按cid去重。文档默认20条/页、最多50条；cursor分页，未到末页。 [来源](https://qovia.ai/docs/api-reference/raw.douyin.comments/) |
| 小红书商品：商品买家评价 | 样本通过：2页40条；$5.556 / 千个计费单位；每页一次。同一商品连续2页各20条，40个不同ID，仍有后页。返回正文、评分、SKU、日期、图片等；不返回评价人ID/昵称/头像。每页约$0.005556，token有效24小时。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=xiaohongshu) | 未核对应端点；未核报价；不适用。当前仅核笔记评论/蒲公英精选评论，未核商品购后评价。 [来源](https://qovia.ai/openapi.json) |
| 小红书笔记 V1：内容互动评论 | 样本通过：25条去重24条；$5.556 / 千个计费单位；每页一次。同一笔记2页10+15条，25条中1个重复ID，去重24条，仍有后页。完整楼中楼需另调sub_comments；token有效24小时。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=xiaohongshu) | 样本通过：2页10条；$5 / 千次成功非空请求；一次成功非空请求，不是单条评论。同一笔记default排序2页各5条、10个不同ID，仍有后页。原样字段；完整子评论须另调回复接口。latest排序与其他版本尚未实调。 [来源](https://qovia.ai/docs/api-reference/raw.xiaohongshu.comments/) |
| 小红书笔记 V4：内容互动评论原样JSON | 未核对应端点；未核报价；不适用。没有对应V4命名；标准笔记评论见上一行。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 文档Live / Beta，未实调；$16.91 / 千次成功非空请求；一次成功非空请求，不是单条评论。只返回第一页，没有翻页参数；响应cursor/has_more仅供参考。 [来源](https://qovia.ai/docs/api-reference/raw.xiaohongshu.comments_v4/) |
| 快手视频 V1：内容互动评论 | 文档已列，未实调；$1.597 / 千个计费单位；每页一次。每页50条；page_token分页，token 24小时有效； [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=kuaishou) | 文档Live / Beta，未实调；$1 / 千次成功非空请求；一次成功非空请求，不是单条评论。cursor分页；页大小及实际可读深度需样本验收。 [来源](https://qovia.ai/docs/api-reference/raw.kuaishou.comments/) |
| 快手视频 V2：内容互动评论 | 未核对应端点；未核报价；不适用。没有独立V2对照；标准评论见上一行。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 文档Live / Beta，未实调；$0.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。pcursor分页，默认20条/页、最高100条；可能约90秒才返回，has_more=false停止。 [来源](https://qovia.ai/docs/api-reference/raw.kuaishou.comments_v2/) |
| B站视频：内容互动评论 | 文档已列，未实调；$0.556 / 千个计费单位；每成功非空调用一次。单次上限10条；未声明分页。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=bilibili) | 文档Live / Beta，未实调；$0.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。每页20条，热度排序；cursor分页，完整子回复另调回复接口，不含IP属地。 [来源](https://qovia.ai/docs/api-reference/raw.bilibili.comments/) |
| 微博：内容互动评论 | 文档已列，未实调；$0.556 / 千个计费单位；每成功非空调用一次。单次上限50条；未声明分页。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=weibo) | 文档Live / Beta，未实调；$1 / 千次成功非空请求；一次成功非空请求，不是单条评论。cursor分页，count控制每页条数；历史深度待验。 [来源](https://qovia.ai/docs/api-reference/raw.weibo.comments/) |
| 知乎回答：内容互动评论 | 文档已列，未实调；$0.556 / 千个计费单位；每成功非空调用一次。单次上限100条；未声明分页。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=zhihu) | 文档Live / Beta，未实调；$1 / 千次成功非空请求；一次成功非空请求，不是单条评论。回答评论cursor分页、支持排序；非商品买家评价。 [来源](https://qovia.ai/docs/api-reference/raw.zhihu.comments/) |
| 贴吧：帖子楼中楼回复 | 未核对应端点；未核报价；不适用。当前目录没有tieba对应平台能力。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 文档Live / Beta，未实调；$1.5 / 千次成功非空请求；一次成功非空请求，不是单条评论。每页10条楼中楼回复；cursor=null停止；阶梯起始档$1.5/千次，适用月量档超过500万次后的边际价$1/千次。 [来源](https://qovia.ai/docs/api-reference/raw.tieba.replies/) |
| 微信公众号：文章评论 | 文档已列，未实调；$6.764 / 千个计费单位；每成功非空调用一次。单次上限260条；未声明分页。 [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=wechat_oa) | 未核对应端点；未核报价；不适用。有公众号搜索、文章、互动数等API，未核逐条文章评论端点。 [来源](https://qovia.ai/openapi.json) |
| 微信视频号：视频评论 | 文档已列，未实调；$8 / 千个计费单位；每页一次。每页25条；page_token分页，token 24小时有效； [来源](https://api.everyinfra.com/api/v1/social/catalog?platform=wechat_channels) | 未核对应端点；未核报价；不适用。有视频号搜索API，未核逐条视频评论端点。 [来源](https://qovia.ai/openapi.json) |
| 1688：商品买家评价 | 未核对应端点；未核报价；不适用。有搜索/详情/图搜，未核商品评价正文。 [来源](https://api.everyinfra.com/api/v1/social/catalog) | 未核对应端点；未核报价；不适用。现行目录未核1688平台API。 [来源](https://qovia.ai/openapi.json) |

## 请求额度与接入限制

| 项目 | EveryInfra | Qovia |
| --- | --- | --- |
| 试用资格与额度 | 实测注册默认$0；按控制台要求绑定GitHub并给两个指定仓库点星后，成功领取$1。账户/GitHub各限一次；此次未付费充值。 | 实测50次成功非空试用到账；14次评论请求中9次非空成功、5次失败，最终剩41次。此次未付费充值。 |
| 试用到期 | 控制台实见赠送额2026-11-07 15:08 UTC+8到期，领取后24小时；不是每日重置。 | 未核试用额度到期时间，不是每天50次。本次Key设置30天有效期，这是密钥期限，与试用额度期限不同。 |
| 默认RPM与升级 | 默认60 RPM，账户全部Key共用；180/600/1800 RPM可购30天提速包$10/$30/$78，或累计充值达$50/$150/$750。 | 账户API及响应头实见60 RPM；文档首充后600 RPM，所有Key和调试台共享60秒滑动窗口。尚未充值或验证升级吞吐。 |
| 每日请求总量 | 未核统一每日硬额度；不能承诺无限量。 | 未核统一每日硬额度；不能承诺无限量。 |
| 付费余额与周期 | 充值余额长期有效、不清零；月累计充值折扣次月重算，余额不因此失效。 | 未核公开余额有效期或清零规则。 |
| 分页令牌与历史深度 | 实测小红书商品/笔记及抖音评论可继续翻页；淘天/JD评价未声明分页。文档部分page_token有效24小时；token过期不等于已下载评论被删除。 | 实测JD连续3页30条，max_page为2/4/6动态变化；抖音视频存在跨页重复。抖店文档样本两页32条后has_more=false。参数上限不是可读历史承诺。 |
| 结果/日志保留TTL | 任务结果、请求原文与日志未核固定保留天数；已下载评论未见每日删除条款。 | 请求与结果未核固定保留天数；已下载评论未见每日删除条款。 |
| 风控、429与并发 | 按Retry-After等待；数据API统一并发数未核；取job和查account不计RPM，不能套用AI接口并发档。 | 除账户RPM外，某些端点有全用户合计QPS；10分钟≥50次且>80%空/不存在/被拒时限流；认证错误亦有限流。 |
| 接入工作量 | 实测服务端用一个POST入口+Bearer，以platform/action/params切换渠道；本次响应同步返回。生产仍需异步job处理、分页、去重和字段映射。 | 实测同域名GET端点+一个Bearer Key；本次Key仅授权淘/JD/抖音/小红书。外层统一、data字段不同；生产需逐类映射、去重与重试，文档要求服务端调用。 |
| schema与版本稳定性 | 共同results/billing/quota外层；逐平台字段、参数与计费不同，未核长期schema兼容承诺。 | OpenAPI 0.1.0；评论端点Beta，字段可能变化；原样V2与标准化V1不能直接互换。 |
| SLA与服务责任 | 按现状/可用性提供，无不中断保证；可调整限流，累计责任上限为争议前三个月实付费用。 | 未核公开量化SLA、停服赔偿或完整责任分配；页面为条款摘要，正式合同为准。 |
| 底层内容权利与转售 | 仍须遵守来源规则；未获批准不得转售或共享账号，批准服务商另有规则。 | 不主张底层内容所有权；数据集按各自许可，下游须遵守来源规则；未授统一永久保存/再分发许可。 |
| 避风港/客户免责 | 未找到向客户提供避风港或DMCA免责保证的具体条款。 | 未找到向客户提供避风港或DMCA免责保证的具体条款。 |
| 侵权投诉与内容下架 | 隐私页说明账户资料删除，日志/账务等有保留例外；未核评论侵权投诉、下架时限、反通知与同步删除流程。 | 隐私页提供删除申请联系方式；未核评论侵权投诉、下架时限、反通知与已交付数据删除流程。 |
| 失败计费和充值退款 | 实测淘宝3次空结果未最终扣费；抖音未返回的预扣单位有退款。未核通用余额退款承诺，文档提速包购买不退。 | 实测淘宝503/502共5次失败，最终试用余额证明未消耗额度。文档失败/空/超时不计费；充值通常不退，确认接口不可用的有限退款条件以定价页为准。 |
| 支付手续费与折扣 | 付款附加手续费未核；自然月累计充值$500/$1000/$2000后下一次调用9/8/7折。 | 卡/支付宝4.4%+$0.30，USDT 2%+$0.30；评论固定价接口不享通用阶梯降价。 |

### 限制来源

- 试用资格与额度：[来源1](https://everyinfra.com/pricing) [来源2](https://everyinfra.com/docs) [来源3](https://qovia.ai/zh/pricing/) [来源4](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- 试用到期：[来源1](https://everyinfra.com/terms) [来源2](https://qovia.ai/zh/docs/) [来源3](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- 默认RPM与升级：[来源1](https://everyinfra.com/pricing) [来源2](https://qovia.ai/zh/docs/#rate-limits) [来源3](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- 每日请求总量：[来源1](https://api.everyinfra.com/api/v1/social/catalog) [来源2](https://everyinfra.com/docs) [来源3](https://qovia.ai/zh/docs/)
- 付费余额与周期：[来源1](https://everyinfra.com/pricing) [来源2](https://qovia.ai/zh/pricing/)
- 分页令牌与历史深度：[来源1](https://everyinfra.com/docs) [来源2](https://api.everyinfra.com/api/v1/social/catalog) [来源3](https://qovia.ai/docs/api-reference/raw.jd.comments/) [来源4](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- 结果/日志保留TTL：[来源1](https://everyinfra.com/privacy) [来源2](https://everyinfra.com/docs) [来源3](https://qovia.ai/privacy/)
- 风控、429与并发：[来源1](https://everyinfra.com/docs) [来源2](https://qovia.ai/zh/docs/#rate-limits)
- 接入工作量：[来源1](https://everyinfra.com/docs) [来源2](https://qovia.ai/zh/docs/) [来源3](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- schema与版本稳定性：[来源1](https://api.everyinfra.com/api/v1/social/catalog) [来源2](https://everyinfra.com/openapi.json) [来源3](https://qovia.ai/openapi.json)
- SLA与服务责任：[来源1](https://everyinfra.com/terms) [来源2](https://qovia.ai/terms/)
- 底层内容权利与转售：[来源1](https://everyinfra.com/terms) [来源2](https://qovia.ai/terms/)
- 避风港/客户免责：[来源1](https://everyinfra.com/terms) [来源2](https://qovia.ai/terms/)
- 侵权投诉与内容下架：[来源1](https://everyinfra.com/privacy) [来源2](https://everyinfra.com/terms) [来源3](https://qovia.ai/privacy/) [来源4](https://qovia.ai/terms/)
- 失败计费和充值退款：[来源1](https://everyinfra.com/terms) [来源2](https://everyinfra.com/pricing) [来源3](https://qovia.ai/zh/pricing/) [来源4](https://118.145.70.247/ecommerce-data-research-20261105/data/live-trials.json)
- 支付手续费与折扣：[来源1](https://everyinfra.com/pricing) [来源2](https://everyinfra.com/openapi.json) [来源3](https://qovia.ai/zh/pricing/)

## 全目录价格范围

已保存 EveryInfra 106个平台的573项能力和 Qovia 25个平台的164个目录端点，共131组供应商平台记录、737项端点。包含未开放条目，状态在原始JSON中保留。一个平台可同时包含商品、搜索、详情、评论、作者等多种能力，平台价格区间不能当评论统一价。

[完整对比 JSON](comparison.json) · [EveryInfra 全目录报价](everyinfra-all-prices.json) · [Qovia 全目录报价](qovia-all-prices.json) · [Excel 对比表](EveryInfra-Qovia-对比.xlsx)

## 仍待验证的问题

1. 扩大商品与内容样本，验证淘宝失败是否可恢复；对支持分页的端点持续翻页至停止条件，记录去重数量和日期，避免将本次最早日期当作历史边界。
2. 验证追评、完整楼中楼、非空商家回复、图片及多SKU合并；区分字段出现、非空和内容质量。
3. 在官方账户速率内另行验证重试、429、并发及长期成功率；本次低量调用与RPM设置不能证明稳定吞吐或生产SLA。
4. 核实每日硬额度、Qovia试用到期、任务结果与日志保存期；已观察到的账户余额和试用次数附有时间，后续使用会改变。
5. 对拼多多、美团/大众点评缺口及长期存储、展示、再分发许可，需要供应商给出具体端点或合同条款；当前不按已支持或已获授权处理。

两家已取得真实非空评论响应，但本报告只支持所列小样本结果。公开目录、文档样例、账户规则与实际调用证据分别列示，不把其中任何一项推导为全部平台、全历史或长期稳定性保证。
