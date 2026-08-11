
<map>
  <node ID="root" TEXT="VLA数据任务平台-V1.0">
    <node TEXT="任务管理（林禹成）" ID="29b9f570a51d20ad32a7894a3e532d0f" STYLE="bubble" POSITION="right">
      <node TEXT="数据总览区域" ID="f2f148eb52d91576f4ee0bed43865044" STYLE="fork">
        <node TEXT="总任务数" ID="4e6f99ccd63b85d2b8fa06b62d7b4717" STYLE="fork">
          <node TEXT="所有任务的总数" ID="44991855f4b53fda745c76c4d0d648cb" STYLE="fork"/>
        </node>
        <node TEXT="已创建" ID="3aac2bc3cab08331c2dea192b42a64d1" STYLE="fork">
          <node TEXT="所有任务中，状态为“已创建”的任务数量" ID="d20f5f37719254cb9867ca3322b4c866" STYLE="fork"/>
        </node>
        <node TEXT="已采集" ID="da3dfd45f16fac720feb0af4d8f907ff" STYLE="fork">
          <node TEXT="所有任务中，状态为“已采集”的任务数量" ID="7d23dfc699f002d36bf51cf1bafbfbea" STYLE="fork"/>
        </node>
        <node TEXT="已标注" ID="9f8edd1fd30a9f08bfdb76eda68d5dc0" STYLE="fork">
          <node TEXT="所有任务中，状态为“已标注”的任务数量" ID="33827901084e3fae8e4faa3bf331627e" STYLE="fork"/>
        </node>
        <node TEXT="已质检" ID="b62894ef056da4cbbd818685f9245860" STYLE="fork">
          <node TEXT="所有任务中，状态为“已质检”的任务数量" ID="aa17359fead3c80345ac7cbc4c1ff80b" STYLE="fork"/>
        </node>
        <node TEXT="已转换" ID="3de9b977e1237c15c7ef8116a3d8a318" STYLE="fork">
          <node TEXT="所有任务中，状态为“已转换”的任务数量" ID="60c6a13a23e4a6ccde2fc07bdabe6086" STYLE="fork"/>
        </node>
      </node>
      <node TEXT="查询" ID="51b99ce943ea88f67b3ecabfed081241" STYLE="fork">
        <node TEXT="任务名称/编号" ID="5add069eb03b69223d3d5d90aa4a7f8b" STYLE="fork">
          <node TEXT="支持单个模糊查询" ID="a8e618518e6a36b1af3f18267bd83383" STYLE="fork"/>
        </node>
        <node TEXT="状态[下拉框]" ID="163bb204d99d99e780e621ab06a00482" STYLE="fork">
          <node TEXT="已创建" ID="5b66b169f400f819d6507f48e2dcc28b" STYLE="fork"/>
          <node TEXT="已采集" ID="5891472f3ae11c5100b2f340931f9302" STYLE="fork"/>
          <node TEXT="已标注" ID="f2d1d7d9a7c0a20706d794aa5b08c262" STYLE="fork"/>
          <node TEXT="已质检" ID="3c27d56d99e9f419e7b8ecf013c58558" STYLE="fork"/>
          <node TEXT="已转换" ID="2ea28f7658b97aeda239152fb383a784" STYLE="fork"/>
        </node>
        <node TEXT="【查询】" ID="c91a9a4cdf42a5f9aeb674f6878e2a67" STYLE="fork">
          <node TEXT="查询显示符合筛选条件的数据" ID="00ea425210b2d78796e3a84c24329e65" STYLE="fork"/>
          <node TEXT="翻页后查询数据正常" ID="e52ebd034970f43f706251b70f53d921" STYLE="fork"/>
        </node>
        <node TEXT="【重置】" ID="6af4c09d9da02ec6e8a88ab1307af40d" STYLE="fork">
          <node TEXT="回到默认为空进行查询" ID="c7f5bc3f4b56c6b85845d34eabc2f724" STYLE="fork"/>
        </node>
      </node>
      <node TEXT="【创建任务】" ID="af126322b8a3124426070747e9b2f13c" STYLE="fork">
        <node TEXT="* 任务名称" ID="113536109d3a2ca4e56d0004aac6c615" STYLE="fork">
          <node TEXT="必填项" ID="f6bf275eb567d282d48202b5fba51495" STYLE="fork"/>
          <node TEXT="限制" ID="54a4991aaf63d8871374a16ce49753b4" STYLE="fork">
            <node TEXT="长度&lt;=32" ID="8abb7a7774c9d849854d211274da1ec8" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字、_ 、-" ID="d22dd07598763ed9b6f7b63c518814ed" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="任务描述" ID="cfc8eb5e23b9c1b2175fe0b7234bdf8a" STYLE="fork">
          <node TEXT="限制" ID="e1b523dfb524302061751fb02c5c3a65" STYLE="fork">
            <node TEXT="长度&lt;=255" ID="cc6d5ae7fd88509572b62a76ebc26e29" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="标注层级" ID="820087464d0e417c0bc42c0aeeb8f25d" STYLE="fork">
          <node TEXT="【添加根节点】" ID="56d2af6023c62c2e8ee5b4575e1505f8" STYLE="fork">
            <node TEXT="长度&lt;=16" ID="ff9de9548da3b6153cb99e1b631d4188" STYLE="fork"/>
          </node>
          <node TEXT="鼠标移动到已添加的根节点上" ID="e96c3ef195d926afad20edc86d8949d3" STYLE="fork">
            <node TEXT="【+同级】" ID="7fe036343b1dded3a7540c969ec7c18c" STYLE="fork">
              <node TEXT="添加同级节点" ID="63509701a43cdffa2c8f8a2876ddf6e9" STYLE="fork">
                <node TEXT="长度&lt;=16" ID="77b90b7622c2d9c4236cb9c549d0f468" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="【+子级】" ID="547b10f6428a9a9c33b38c262a4cc2a2" STYLE="fork">
              <node TEXT="添加节点下的子节点" ID="a67adcd46056c79e7627acf9b97853be" STYLE="fork">
                <node TEXT="长度&lt;=16" ID="86cbfb83e9506c957d680bb86215d365" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="【编辑】" ID="80ff0c347847d35379840444d56ddf94" STYLE="fork">
              <node TEXT="回显，可重新编辑节点名" ID="7a3a6ec46308d6b6a21c5ffbefbce891" STYLE="fork">
                <node TEXT="长度&lt;=16" ID="b99cecaf409cbd3975c35e795d785f51" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="【删除】" ID="f3d98c26e4901496a5927c411f1e1205" STYLE="fork">
              <node TEXT="节点下无子节点" ID="35c907eaba32554bb547bde0db3a2661" STYLE="fork">
                <node TEXT="二次确认“确定删除该节点？”" ID="61a8111ca6fce1a62d711177eb0c5fb9" STYLE="fork">
                  <node TEXT="删除该节点" ID="7d08817d702738bbe45ff175a74f56df" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="节点下有子节点" ID="9cd9579eb6cb1d305a58a928b2a0bfaa" STYLE="fork">
                <node TEXT="二次确认“确定删除该节点及其下 X 个子节点？”" ID="b5e7f3bf681cc703e8a8930883db01a8" STYLE="fork">
                  <node TEXT="删除节点，节点下有子节点一并删除" ID="d933f204dbccb961dd49def0c99a473b" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="作用：根节点相当于标注的L1层，根节点下的子节点相当于标注的L2层，依此类推。标注新增时，“描述”下拉中会展示对应的节点名称，用于标注时的快速选择，无需自己再手动输入" ID="a80fa64d4063ca5037df658e4646df33" STYLE="fork"/>
        </node>
        <node TEXT="* 数据分类" ID="7614c2d7a17d81f5e59e270f03fdbef3" STYLE="fork">
          <node TEXT="必填项，单选" ID="15e7270eb4f55173c442da07ac614bab" STYLE="fork"/>
          <node TEXT="下拉数据来源：数据分类管理" ID="61987cc1a08662a3295451213c44d4a3" STYLE="fork"/>
          <node TEXT="展示规则：分类编码 - 分类名称" ID="b027a94ccd3d27b90c0d815b9160d4f2" STYLE="fork"/>
          <node TEXT="创建时间倒序" ID="018b903147b07a8cea2fba41dcf70dcd" STYLE="fork"/>
        </node>
        <node TEXT="* 标签" ID="f5f96762a6067b0e79d8727b7c73b180" STYLE="fork">
          <node TEXT="必填项，可多选" ID="6c75d92203bab29d7b12841390a2c98b" STYLE="fork"/>
          <node TEXT="下拉数据来源：标签管理" ID="86b0d6c2f7a7f8d9341c0cb96f6a61b5" STYLE="fork"/>
          <node TEXT="展示规则：标签名称     标签分类" ID="1bf576968eb27efab621cae14c10c8d7" STYLE="fork"/>
          <node TEXT="创建时间倒序" ID="816aab1dec1958f72c4f80ffcd56ddf6" STYLE="fork"/>
        </node>
        <node TEXT="* 机器人构型" ID="39bbaf093ddae5004bb0df669a0bf369" STYLE="fork">
          <node TEXT="必填项，单选" ID="e00edab6ed359f9c9b3ab2a7c430d5ed" STYLE="fork"/>
          <node TEXT="下拉数据来源：机器人构型管理" ID="c6dbad6a9218d11c3af9ecb6a98c1766" STYLE="fork"/>
          <node TEXT="展示规则：构型名称（机器人型号）" ID="3f67305f102902a0d4a90787dff39bb0" STYLE="fork"/>
          <node TEXT="创建时间倒序" ID="228fecadcb2ce3aaa40edb9c87dc424c" STYLE="fork"/>
        </node>
        <node TEXT="采集要求" ID="cfd442e22174916c6915975cb6a0c743" STYLE="fork">
          <node TEXT="限制" ID="3b9edf9b3f50e13523e7d8666b473cf6" STYLE="fork">
            <node TEXT="长度&lt;=255" ID="203e5767b1ce485e790cf0fce668ea7d" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="* 目标数量" ID="d57127e549c9797e5c1c6271ce9860a7" STYLE="fork">
          <node TEXT="默认：100" ID="a11db741fd6a6c7c19deddf86a869fc8" STYLE="fork"/>
          <node TEXT="可输入范围 [1,10000]" ID="42b333c26fd6cdff4e60e4374e10b49c" STYLE="fork"/>
        </node>
        <node TEXT="优先级" ID="600b08307245dd71dcf5f0c9444ac817" STYLE="fork">
          <node TEXT="低" ID="3e5c48fb2a93c619dd5ce8bf7b0ada5c" STYLE="fork"/>
          <node TEXT="中" ID="e7def1624121a5f2fdf52c947b4c1778" STYLE="fork">
            <node TEXT="默认" ID="a7d1f7c1ede5b5b0c1c85b23cb8c8aa3" STYLE="fork"/>
          </node>
          <node TEXT="高" ID="ea88886218e1a5422b3a78c3035d5dd9" STYLE="fork"/>
        </node>
        <node TEXT="【取消】" ID="068d1272ce0426a0f6e1e0d80711001d" STYLE="fork">
          <node TEXT="关闭弹框，不创建" ID="cf0f5606c53c95ae1315706ba8e3d61d" STYLE="fork"/>
        </node>
        <node TEXT="【创建任务】" ID="4eff1892d28d699bab23a67b75b50de4" STYLE="fork">
          <node TEXT="校验" ID="c92b5e10af9ffe488fc376bd55bd1118" STYLE="fork">
            <node TEXT="必填项校验" ID="bc76c04377b10926e3f6a7fa328dfdcd" STYLE="fork"/>
            <node TEXT="幂等测试" ID="31512322b5dc1b01ab4ac5604528b3de" STYLE="fork">
              <node TEXT="任务名称唯一性校验" ID="87f8e6f9c230e4b4c76f28ba64aa5d6b" STYLE="fork"/>
            </node>
            <node TEXT="创建任务时，先选择了数据分类A，点击创建任务之前删除了数据分类A" ID="8d1cdd726aa8451454c3e7845c4f18a0" STYLE="fork">
              <node TEXT="点击创建任务时，应创建失败，提示不存在" ID="43025867a351f8ff6b6548aaae7d51c1" STYLE="fork"/>
            </node>
            <node TEXT="创建任务时，先选择了标签A，点击创建任务之前删除了标签A" ID="106e2d93ca67573a5b4349f391d260fd" STYLE="fork">
              <node TEXT="点击创建任务时，应创建失败，提示不存在" ID="c149cc1ba066dd7960e1d432c345cf94" STYLE="fork"/>
            </node>
            <node TEXT="创建任务时，先选择了机器人构型A，点击创建任务之前删除了机器人构型A" ID="bc2f6de281b734b9b6abafe70565d80f" STYLE="fork">
              <node TEXT="点击创建任务时，应创建失败，提示不存在" ID="cc999680c77268de2c0921ec5f2bc4ab" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="创建成功后，列表页生成一条数据，状态为“已创建”，采集人、标注人、质检人展示“未指派”" ID="48a002d6309def46a00e2b1f3dae6e5b" STYLE="fork"/>
        </node>
      </node>
      <node TEXT="列表页" ID="3359c89d7bad24eb516ee08057d94efd" STYLE="fork">
        <node TEXT="任务编号" ID="7ec677987f3cb8e7c7532c87e114bb99" STYLE="fork">
          <node TEXT="自动生成，规则：TASK-年-001自增" ID="17d7475d451a1577db0a141db58198a6" STYLE="fork"/>
        </node>
        <node TEXT="任务名称" ID="1f812935bb9a87b65a628805e89434cd" STYLE="fork">
          <node TEXT="与创建任务时填写的一致" ID="e5eda172056beda320b560bda5a5f62e" STYLE="fork"/>
        </node>
        <node TEXT="分类" ID="ee1b460066563bf2eeb0c027e61ed459" STYLE="fork">
          <node TEXT="与创建任务时选择的数据分类一致" ID="322355c22dd7e4f04f0b98b15f2eeb55" STYLE="fork">
            <node TEXT="只展示分类名称" ID="5cc435a59ab40ad68f34f51ea87fb6e7" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="状态" ID="351233e7dcc73a95105ce70bf01e40e9" STYLE="fork">
          <node TEXT="已创建" ID="2ff73d91d1f3f71ba477abaeb3f9539f" STYLE="fork"/>
          <node TEXT="已采集" ID="9d51c33793053d358f7d84e18917a6b7" STYLE="fork"/>
          <node TEXT="已标注" ID="ee4a5f250cd195195e15391f0d69f2cc" STYLE="fork"/>
          <node TEXT="已质检" ID="81af1709966ea19664b86469adfef90a" STYLE="fork"/>
          <node TEXT="已转换" ID="2b1d392bf50b3ab7aeafc4895dafa195" STYLE="fork"/>
        </node>
        <node TEXT="采集人" ID="e084b9f13ae69f64425a2662110e47ac" STYLE="fork">
          <node TEXT="刚创建时展示“未指派”" ID="819da6c7c4a5b55da0a0f13812344f31" STYLE="fork"/>
          <node TEXT="指派后展示用户姓名" ID="299ec514b3b5531e52a9c43366331e05" STYLE="fork">
            <node TEXT="修改用户姓名后对应变更" ID="5a52f71d486123da7527dd57e36d5062" STYLE="fork"/>
          </node>
          <node TEXT="后续谁点击了完成采集，该任务的采集人会更新为那个人" ID="d0345f5b3ae7758f79ed7f2dc4d2156d" STYLE="fork"/>
        </node>
        <node TEXT="标注人" ID="7d426155e39039b1ca17d51f83d1ce50" STYLE="fork">
          <node TEXT="刚创建时展示“未指派”" ID="fb50be9af74e1e2980a67adb577b3211" STYLE="fork"/>
          <node TEXT="指派后展示用户姓名" ID="7b10d5bbdeeddbcac0d91808e2b7af5a" STYLE="fork">
            <node TEXT="修改用户姓名后对应变更" ID="9ab969887276d11ca8c514a90205ab4e" STYLE="fork"/>
          </node>
          <node TEXT="后续谁点击了提交标注，该任务的标注人会更新为那个人" ID="98c0dbef5ae8e21e0b3af59bd073d7c7" STYLE="fork"/>
        </node>
        <node TEXT="质检人" ID="a2d6847b285e113fe19c4cba640b4524" STYLE="fork">
          <node TEXT="刚创建时展示“未指派”" ID="fab2a5ae7031ad601b4b68b4f6231564" STYLE="fork"/>
          <node TEXT="指派后展示用户姓名" ID="0b33a64a47894b460eefbd9ca358405b" STYLE="fork">
            <node TEXT="修改用户姓名后对应变更" ID="f7164e80e87b15fe902161ed70a3c0b1" STYLE="fork"/>
          </node>
          <node TEXT="后续谁点击了质检完成，该任务的质检人会更新为那个人" ID="f962ac854e911fdff1e9594a8239e29a" STYLE="fork"/>
        </node>
        <node TEXT="创建时间" ID="aea5db19ac4d58cb23982c22c75062aa" STYLE="fork">
          <node TEXT="展示：年月日 时分秒" ID="92b79b6c45bb881ea4a82aae6d6953ea" STYLE="fork"/>
          <node TEXT="列表排序：创建时间倒序" ID="37f8335a555621468a2637e29df1e144" STYLE="fork"/>
        </node>
        <node TEXT="操作" ID="c0f17d669aaf328fad111bf6d51bd6a3" STYLE="fork">
          <node TEXT="【详情】" ID="95f826cdbc6eeedd80963021f12ef8d2" STYLE="fork">
            <node TEXT="基本信息" ID="2ddaf7303015c184e65daf10bad3dabd" STYLE="fork">
              <node TEXT="任务编号" ID="5f390a76cd32a541788c1afa044c2d4d" STYLE="fork">
                <node TEXT="与列表页一致" ID="e52db9aae7e00ee205f8f2d7bd9b5aae" STYLE="fork"/>
              </node>
              <node TEXT="创建人" ID="26574f9431ee51c5c82fe6e209722e58" STYLE="fork">
                <node TEXT="创建该任务的用户姓名" ID="bb77d8ae17f44e75afd886d2bac376ee" STYLE="fork"/>
              </node>
              <node TEXT="分类" ID="03f5e6b894c44b7b2ff60fe6dac9ad01" STYLE="fork">
                <node TEXT="与列表页一致" ID="598b9c6090579fc2f0f29d2cebecc3c1" STYLE="fork"/>
              </node>
              <node TEXT="机器人构型" ID="93949b519f6a3a77fd06ec61a156450c" STYLE="fork">
                <node TEXT="创建任务时选择的机器人构型" ID="9f658ca3c635c0b474fb4ec63a147466" STYLE="fork"/>
                <node TEXT="展示规则：构型名称（机器人型号）" ID="713476e46049d8638fc895e67b5c90c2" STYLE="fork"/>
              </node>
              <node TEXT="标签" ID="ed8338f27514957fbd7a979f03675302" STYLE="fork">
                <node TEXT="创建任务时选择的标签，逗号分隔" ID="00d93742067537263d69a81b4d2d4afb" STYLE="fork"/>
              </node>
              <node TEXT="目标数量" ID="dcc55701a1673af33977f94f49b11d7e" STYLE="fork">
                <node TEXT="创建任务时输入的目标数量" ID="a2ea3bb67e46ca0450bfa51b78338b57" STYLE="fork"/>
              </node>
              <node TEXT="优先级" ID="569187cd333551163c80cf9a8a3b4478" STYLE="fork">
                <node TEXT="创建任务时选择的优先级" ID="f400aa4864eecd64b25468976e83067e" STYLE="fork"/>
              </node>
              <node TEXT="采集要求" ID="ee33338873b1d24fe6b851543322bb48" STYLE="fork">
                <node TEXT="创建任务时输入的采集要求" ID="3e4b96ab4f16a25dc197d8a3c98b41e3" STYLE="fork"/>
              </node>
              <node TEXT="任务描述" ID="66e2caefa2272782cf257d38aea432e0" STYLE="fork">
                <node TEXT="创建任务时输入的任务描述" ID="c26a8b0b6dd33dda8a11fb2be8d0aadb" STYLE="fork"/>
              </node>
              <node TEXT="标注层级" ID="5eb3a4d7d52b836567fe58468ff1469c" STYLE="fork">
                <node TEXT="创建任务时输入的标注层级" ID="a4006e197d9da65e9fcf5177f65c89b6" STYLE="fork"/>
              </node>
              <node TEXT="S3 根目录" ID="28421621f5dae87a478438c9d0fc6cba" STYLE="fork">
                <node TEXT="刚创建任务时，显示：- " ID="9309b310e4d646c6c83a51ebd4a0514b" STYLE="fork"/>
                <node TEXT="已采集之后显示：s3://vla-label-studio/[任务编号]/original-data/" ID="15427f948f400ebec70681e023b35fe4" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="人员分配" ID="7ae8f9ee8984c65135b22d395d8aacb2" STYLE="fork">
              <node TEXT="未分配时" ID="b23e3eb83786e0529002d74825023e79" STYLE="fork">
                <node TEXT="采集人员：-" ID="1dd44a647b67b586d1a42222f4b03cda" STYLE="fork"/>
                <node TEXT="标注人员：-" ID="78f2909bbad104f9f7f0254c0140630a" STYLE="fork"/>
                <node TEXT="质检人员：-" ID="a982c0c21a2a9b9a7a1ffbd8b7b7d517" STYLE="fork"/>
              </node>
              <node TEXT="分配后" ID="4d4f56383dbe995afbb186a106100f73" STYLE="fork">
                <node TEXT="采集人员：分配的人员姓名" ID="c794e241012baf29fcbedd05d5ac2396" STYLE="fork"/>
                <node TEXT="标注人员：分配的人员姓名" ID="533b30f5d209464157c5e5b5c69116c1" STYLE="fork"/>
                <node TEXT="质检人员：分配的人员姓名" ID="cb54c7418997b347544fd639afbde49f" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="文件列表" ID="3c67b343ad84d1b54ba2ef054fbb4dfa" STYLE="fork">
              <node TEXT="刚创建任务时，显示为空 " ID="a7ba356e99f5664204025a8eb0c1a8a8" STYLE="fork"/>
              <node TEXT="采集之后显示：相对路径、文件名、类型、大小、S3路径" ID="7f913e7d0b74a318f98744a6b52b59c4" STYLE="fork"/>
            </node>
            <node TEXT="操作日志" ID="a64bbc12b25674396bf33eda7e3ba963" STYLE="fork">
              <node TEXT="1" ID="f7fdbe6b3d961b80e75dcb0364b45a18" STYLE="fork">
                <node TEXT="时间：年月日 时分" ID="215e71cee7d4f917a294bfd260743274" STYLE="fork"/>
                <node TEXT="创建任务 - [用户姓名]" ID="b40f560daaa04d0435d0b1626e53abbe" STYLE="fork">
                  <node TEXT="谁创建了任务" ID="709202caf02cc4fdfc6e4e0c1220d470" STYLE="fork"/>
                </node>
                <node TEXT="创建任务 [任务编号]" ID="484b94f953d4fbe5f0026d46766e9c4e" STYLE="fork"/>
              </node>
              <node TEXT="2" ID="84aa42a573e7f7acd306796568d13608" STYLE="fork">
                <node TEXT="时间：年月日 时分" ID="deef4d1a26164de3a15ea2b6c9b43458" STYLE="fork"/>
                <node TEXT="指派采集 - [用户姓名]" ID="b252e50a7fcf0101db591537b0c01963" STYLE="fork">
                  <node TEXT="谁操作的指派" ID="df42e6458aea8d6c0e1104fbffdde753" STYLE="fork"/>
                </node>
                <node TEXT="分配给[用户姓名]" ID="6b5ebe724f45ddaa5125f8e3429c2ec4" STYLE="fork">
                  <node TEXT="指派给了谁" ID="4c9f43519c9ffa66a7de94e85b0e25d3" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="3" ID="5e5df8ae02d976a4de92b8bb4388c56a" STYLE="fork">
                <node TEXT="时间：年月日 时分" ID="6c7a423772525068bd25a024bcfc6a7e" STYLE="fork"/>
                <node TEXT="指派标注 - [用户姓名]" ID="84bf8da6a79b2244a169ca10c6d57dc7" STYLE="fork">
                  <node TEXT="谁操作的指派" ID="c31bc698b14e0073c17490d5d1ea4c1c" STYLE="fork"/>
                </node>
                <node TEXT="分配给[用户姓名]" ID="12f6ef57b55525ed190197292b3dda8c" STYLE="fork">
                  <node TEXT="指派给了谁" ID="e434938f8e995e5736c9db61bef2baff" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="4" ID="4a97b1a66a4b236854b33216fdf8d665" STYLE="fork">
                <node TEXT="时间：年月日 时分" ID="9be71d00db6472e69c0e93e81dee91b7" STYLE="fork"/>
                <node TEXT="指派质检 - [用户姓名]" ID="d1c67652f12c5d6f976ce80d285c3be4" STYLE="fork">
                  <node TEXT="谁操作的指派" ID="bc52a4dddff316e61d2f2f44185e0a18" STYLE="fork"/>
                </node>
                <node TEXT="分配给[用户姓名]" ID="5cb08d8ba7c9ea6bb93c5a2314485bae" STYLE="fork">
                  <node TEXT="指派给了谁" ID="a72442a280165f6b6e39d76e153c76d7" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="【修改】" ID="17f641628f65f3141bfbd461eb76bc0c" STYLE="fork">
            <node TEXT="* 任务名称" ID="0734d271b062d14ea02443bb124b7ce5" STYLE="fork">
              <node TEXT="回显置灰，不允许修改" ID="1e06b228c8d795e39999ba1a1ce7f942" STYLE="fork"/>
            </node>
            <node TEXT="任务描述" ID="a65bac54fdaeeffe85809f075d9e77e9" STYLE="fork">
              <node TEXT="回显，可修改" ID="37101bdb80713562363fc80dc0bc2587" STYLE="fork"/>
              <node TEXT="限制" ID="13e988ede314f384310e88ad516b42c0" STYLE="fork">
                <node TEXT="长度&lt;=255" ID="116c2f80011275f4102b822915d2efcb" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="标注层级" ID="cd86939ae96b0c4fc04b13ccabc44f6b" STYLE="fork">
              <node TEXT="回显，可修改" ID="e505ca5ddaa5fb60cf949577b8a64876" STYLE="fork"/>
            </node>
            <node TEXT="* 数据分类" ID="2cde8778e4b8167ea729c686b26c9d2c" STYLE="fork">
              <node TEXT="状态非“已转换”时，可以修改" ID="ca7752e63b0d05f03c3f4c1608379392" STYLE="fork"/>
              <node TEXT="状态为“已转换”时，置灰不允许修改" ID="28eb6d2c999536418cf3aff0c2500a4b" STYLE="fork"/>
            </node>
            <node TEXT="* 标签" ID="6d3fd9737595023b5ffecc2289d93a92" STYLE="fork">
              <node TEXT="回显置灰，不允许删除，但可以继续新增标签" ID="10618ca65da37534a7ee23e095e71a45" STYLE="fork"/>
            </node>
            <node TEXT="* 机器人构型" ID="9552355023144c17c18c26cd9d404a66" STYLE="fork">
              <node TEXT="状态为“已创建”时，可以修改" ID="a7590b8273c9f3430145d11f8e84e932" STYLE="fork"/>
              <node TEXT="状态非“已创建”时，置灰不允许修改" ID="03b5adc995ae7a71e4bd7526a7943cef" STYLE="fork"/>
            </node>
            <node TEXT="采集要求" ID="8d097eb7911c5641116191d24f0f1ba2" STYLE="fork">
              <node TEXT="回显，可修改" ID="60c54b5b58baed602ab2febe72b136e3" STYLE="fork"/>
              <node TEXT="限制" ID="266a5018e3cfca977eecadfb2a1b7d62" STYLE="fork">
                <node TEXT="长度&lt;=255" ID="095e30c713d28c14616778d8c07576dd" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="* 目标数量" ID="85250f0cd959c571434cdba650d0b4cb" STYLE="fork">
              <node TEXT="回显，可修改" ID="880f0d3d84b030735c8c1a057456ba87" STYLE="fork"/>
              <node TEXT="可输入范围 [1,10000]" ID="e146b83df28b97a2c201fee166f48605" STYLE="fork"/>
            </node>
            <node TEXT="优先级" ID="ecc20577197223f557c0ebf8486191aa" STYLE="fork">
              <node TEXT="回显，可修改" ID="f2716b400e2bf44a24610ef3a5e3d3c6" STYLE="fork"/>
            </node>
            <node TEXT="【取消】" ID="5771e97d715561ec6492a7e6357b36ff" STYLE="fork">
              <node TEXT="关闭弹框，不修改" ID="b4bba0e9bb6889343e655db662b4bb67" STYLE="fork"/>
            </node>
            <node TEXT="【保存修改】" ID="60d37fa7eaf624b6eedd27d1c180edfa" STYLE="fork">
              <node TEXT="校验" ID="155d3b72d51c7ce39ea89431b5d835cf" STYLE="fork">
                <node TEXT="必填项校验" ID="936698667a6dafe14c82738b5b63323a" STYLE="fork"/>
              </node>
              <node TEXT="保存成功后，对应展示位置相应变更" ID="935062979af8eea2368c92fb0afe34c7" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【指派】" ID="7fc9b1c1d907698046f687dd59cd5366" STYLE="fork">
            <node TEXT="弹出“任务人员指派”弹框" ID="e1f500e4df2ae93aaf0d7925280eeb49" STYLE="fork">
              <node TEXT="展示" ID="bb46517604969f6160f483e55e804e55" STYLE="fork">
                <node TEXT="任务编号" ID="0eb9de98e6a80a981ad688b8134a3d64" STYLE="fork"/>
                <node TEXT="任务名称" ID="54d6153ef7bae3fd237298ee552b20a0" STYLE="fork"/>
                <node TEXT="当前：采集-[人员] | 标注-[人员] | 质检-[人员]" ID="88e0355b939bde993b5a84eec728104c" STYLE="fork"/>
              </node>
              <node TEXT="采集人员" ID="4f28240a7e7fb3b2d9571be80df3604a" STYLE="fork">
                <node TEXT="若之前指派过，回显指派的人员" ID="e7929fd59dc3393631402e22bef26eb7" STYLE="fork"/>
                <node TEXT="下拉数据：具有“采集工程师”角色且状态启用的用户" ID="cfe69266681141ccf39f573a2f64166d" STYLE="fork">
                  <node TEXT="单选，展示格式：姓名（账号）" ID="052f61aa53f9a3c948561a45796d1cdd" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="标注人员" ID="f3f8568348358151911d34cc18daf057" STYLE="fork">
                <node TEXT="若之前指派过，回显指派的人员" ID="7e5ddc729411f0946dede040b03c1bac" STYLE="fork"/>
                <node TEXT="下拉数据：具有“标注工程师”角色且状态启用的用户" ID="b9c46d3942c60441325e9a275aacd487" STYLE="fork">
                  <node TEXT="单选，展示格式：姓名（账号）" ID="afb20eeb99ea9eeafcc97bd7d6a58267" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="质检人员" ID="56ac3732b6889dd04b76a1abea7a94c9" STYLE="fork">
                <node TEXT="若之前指派过，回显指派的人员" ID="f5a0f0cfc821a16ed6b5476f1be33551" STYLE="fork"/>
                <node TEXT="下拉数据：具有“质检工程师”角色且状态启用的用户" ID="472acdb80e6e1de8e195d3b46237d2c1" STYLE="fork">
                  <node TEXT="单选，展示格式：姓名（账号）" ID="2358ea49e5b8602c30f4a8ed2dba49fe" STYLE="fork"/>
                </node>
              </node>
            </node>
            <node TEXT="更换指派人员，任务数据会相应转移" ID="a013c41276a0f1445d871abff1c61a57" STYLE="fork"/>
          </node>
          <node TEXT="【删除】" ID="4a4bd5dc214c5c49909ebcc59770a2fc" STYLE="fork">
            <node TEXT="二次确认" ID="63401216b17c68d0c0f809bcd35fd8f6" STYLE="fork">
              <node TEXT="确认删除「任务编号 / 任务名称」吗？删除后无法恢复。" ID="933510f0a9e68aba62c7469dfb972bb7" STYLE="fork">
                <node TEXT="【取消】" ID="16145e6fe9758e1aba60797f5674c2d9" STYLE="fork">
                  <node TEXT="关闭弹框" ID="c56e419962cd65695b01f48fdce36d2c" STYLE="fork"/>
                </node>
                <node TEXT="【永久删除】" ID="be4db15b35dca1959b578f39f6f5786b" STYLE="fork">
                  <node TEXT="提示：“删除成功”" ID="6718f0525ce24579e100f9f6fbbf1612" STYLE="fork"/>
                  <node TEXT="数据从列表页消失" ID="ef24ec78dff83ea35874fd4769ba8a45" STYLE="fork"/>
                  <node TEXT="所有状态下都可以进行删除操作" ID="b59acbf42cd9ef013293ef009dbd85ee" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
    </node>
    <node TEXT="用户管理（封伟）" ID="bfdb838a517c455e4d7199b3b84c9c12" STYLE="bubble" POSITION="right">
      <node TEXT="查询" ID="45bab3d62268b18d6c7be7014c9c9ccd" STYLE="fork">
        <node TEXT="账号和姓名输入搜索框" ID="d42908606e0e9e7a30885fb369f43e13" STYLE="fork">
          <node TEXT="模糊搜索" ID="56193b8543057e472517d44b4b929e0f" STYLE="fork"/>
          <node TEXT="既可以搜索账号也可以搜索姓名，不支持组合搜索" ID="9a84d9a45071484b0c558d9c9f5cab68" STYLE="fork"/>
        </node>
        <node TEXT="【查询】" ID="47a520aca9ae402574f538f232ecc8c4" STYLE="fork"/>
        <node TEXT="【重置】" ID="d7472472b5816e012fe2fd7c49703416" STYLE="fork">
          <node TEXT="回到默认为空进行查询" ID="308148b8cae028cec59beff3e5fe8025" STYLE="fork"/>
        </node>
      </node>
      <node TEXT="【新建用户】" ID="d1f427bfb3212ae8938d71241492d9bd" STYLE="fork">
        <node TEXT="*账号[输入框]" ID="6f69df3248f70242213122986c126f05" STYLE="fork">
          <node TEXT="必填项" ID="1772d00e19e181d3d824fd66648a5f5f" STYLE="fork"/>
          <node TEXT="限制：" ID="9b28dd278b9a1c8f6645c44baac3fd50" STYLE="fork">
            <node TEXT="长度 [1,32]" ID="7ba4342d8faa21ed7fc5f2935ad1e82c" STYLE="fork"/>
            <node TEXT="仅支持英文字母、数字、_" ID="d26af89bcc23767495104c307cee8bf3" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="*姓名[输入框]" ID="fd2ead74c4eb28f1ab2d7a46512316c6" STYLE="fork">
          <node TEXT="必填项" ID="ae671c7daa8680ecde1508c864cbeccf" STYLE="fork"/>
          <node TEXT="限制：" ID="cc6c2d1c19231cb06be3bf2462ffc991" STYLE="fork">
            <node TEXT="长度 [1,32]" ID="06bcdd7d9c6998c653de603beccbf6d7" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字、_" ID="d839d31ba34ace9e4d30aaa599161d9b" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="*角色[下拉框]" ID="203eb8ce2b5fb1c6f3368ebcdc9e6199" STYLE="fork">
          <node TEXT="管理员" ID="2bebb7eb369e0464f177dc070de687d9" STYLE="fork"/>
          <node TEXT="算法工程师" ID="ba934797e5a52e31e6d7aa6b69b14634" STYLE="fork"/>
          <node TEXT="采集工程师" ID="04cec9c3c3eb0ce04499e81c27166d30" STYLE="fork"/>
          <node TEXT="标注工程师" ID="7e9b897d4b6dc05e89d074b7d5bbc3be" STYLE="fork"/>
          <node TEXT="质检工程师" ID="f4688d59207c907796634d499b7c574c" STYLE="fork"/>
        </node>
        <node TEXT="*初始密码[输入框]" ID="77829aec340060a5fb8c66d7bc0e4871" STYLE="fork">
          <node TEXT="必填项" ID="a1ba1f671f8a3d13e110c36f57fc9a23" STYLE="fork"/>
          <node TEXT="默认：123456" ID="f46b4f87fa0ae850b2bff0b216c21a8b" STYLE="fork">
            <node TEXT="密文显示" ID="0ee62ac9840475d658a00c44885ac768" STYLE="fork"/>
            <node TEXT="点击右侧小眼睛icon可显示明文" ID="cb71cdaa6b56eab90297b2b51a81430d" STYLE="fork"/>
          </node>
          <node TEXT="可自行修改，限制：" ID="6029455fd94c768f10f5eb0d14a803a5" STYLE="fork">
            <node TEXT="长度 [1,32]" ID="bad368b54ce111b9ed691977c8afdb72" STYLE="fork"/>
            <node TEXT="仅支持英文字母、数字" ID="e0c12da16a9d251ba7635b8dd86b775e" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="【取消】" ID="cfd9f6527ad0665d8597d30422286a67" STYLE="fork">
          <node TEXT="关闭弹框不保存" ID="8e0d04abeb1ab8fc79997c9b8014e3a6" STYLE="fork"/>
        </node>
        <node TEXT="【保存】" ID="906aa165273ba79fb7db32ee68c35590" STYLE="fork">
          <node TEXT="校验" ID="a671ea25a5f0505e40e9921a6aef1180" STYLE="fork">
            <node TEXT="必填项校验" ID="312cd3b8f0557ba8199c2d2b6da4e5e1" STYLE="fork">
              <node TEXT="提示：请填写完整信息" ID="94b3080caab3f8beaa0e111c83164ded" STYLE="fork"/>
            </node>
            <node TEXT="幂等校验" ID="5b0439c01c96eafb7920c4cee7b92a13" STYLE="fork">
              <node TEXT="做并发" ID="795f2e8bac608b633ffd6da610b68fbe" STYLE="fork"/>
            </node>
            <node TEXT="账号唯一性校验" ID="4a3ea8b89bf6753bc5c380c5fbb7d152" STYLE="fork">
              <node TEXT="提示：“账号已存在”" ID="d0c633906be4258b604beca0143fe960" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="提示：“创建成功”" ID="8468ecc1c187282a8259fbda894051d1" STYLE="fork">
            <node TEXT="列表页最上方显示刚创建的用户信息" ID="4ed1b2ce70922f5fb58bf85105b49a7e" STYLE="fork"/>
          </node>
        </node>
      </node>
      <node TEXT="列表页" ID="f2f88e611ef365fc2ad8ef3ad2634701" STYLE="fork">
        <node TEXT="账号" ID="9666d4271ef0e9e3484d73b5be723fcf" STYLE="fork">
          <node TEXT="新增时填写的账号" ID="e24cfcd578f2d83261939738c2defd16" STYLE="fork"/>
        </node>
        <node TEXT="姓名" ID="550bcfc67dbeee5e235cf96112f2c866" STYLE="fork">
          <node TEXT="新增时填写的姓名" ID="c199ac1425b6b5ad481714dcacaa3a5c" STYLE="fork"/>
        </node>
        <node TEXT="角色" ID="08509a360461626104d45a84fbf32d23" STYLE="fork">
          <node TEXT="新增时选择的所有角色" ID="07043ba066862d57b7293eeeb3b86687" STYLE="fork"/>
        </node>
        <node TEXT="状态" ID="d58e0121fc8885b0a003b6933b386553" STYLE="fork">
          <node TEXT="启用" ID="a19f00454047f4cef34ff6d4d26078e5" STYLE="fork"/>
          <node TEXT="禁用" ID="8a3f92248d7ed039ff491f687580f763" STYLE="fork"/>
        </node>
        <node TEXT="创建时间" ID="3f8880220b55edfb1fbd5b60313e805a" STYLE="fork">
          <node TEXT="展示：年月日 时分秒" ID="02a4894dd599cf312234b09d72b3aff4" STYLE="fork"/>
        </node>
        <node TEXT="操作" ID="676be76e87406ed02ecdbcfd4fbe1455" STYLE="fork">
          <node TEXT="【编辑】" ID="93a2780ae21a44147a66640cdcdb0f22" STYLE="fork">
            <node TEXT="账号" ID="5449f7338123dfae29cc8ffa2133df6e" STYLE="fork">
              <node TEXT="回显置灰，不允许修改" ID="dc5a693aa45f8e0b76023d861025b574" STYLE="fork"/>
            </node>
            <node TEXT="姓名" ID="c46e0c7184c21b30f18ad187f40c9996" STYLE="fork">
              <node TEXT="回显，可修改" ID="01ffc022c0c1a6560dc34082ed04a225" STYLE="fork"/>
            </node>
            <node TEXT="角色" ID="70a50ab4c2d4830974017c76ced37e37" STYLE="fork">
              <node TEXT="回显，可修改" ID="b8a9c570810d8bb20898187ff49ce516" STYLE="fork"/>
            </node>
            <node TEXT="【取消】" ID="63034800394f05cd66c93d8c12ae2b5e" STYLE="fork">
              <node TEXT="关闭弹框，不保存" ID="4c46bd00727109634d4911a4c5a311e2" STYLE="fork"/>
            </node>
            <node TEXT="【保存】" ID="ef2ed33532966a3599983871d7cb4e3d" STYLE="fork">
              <node TEXT="校验" ID="edf89cc88fb920dc0a1b7dbccd6a3cf7" STYLE="fork">
                <node TEXT="必填项" ID="1ad8b838999be0881f9515982fc41872" STYLE="fork">
                  <node TEXT="提示：请填写完整信息" ID="4db9f85eb3d923b81e9b2c52dc4c15c7" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="角色修改后" ID="87636f52ef58b131a7bc108f45828359" STYLE="fork">
                <node TEXT="未登录状态" ID="008d9bef6eece4e65c6850b08f7dfe30" STYLE="fork">
                  <node TEXT="登录后展示修改后角色权限对应的模块" ID="2cda98de5fa73adb05622344e3297aba" STYLE="fork"/>
                </node>
                <node TEXT="已登录状态" ID="5472311955bcff49e6e5721d22f17171" STYLE="fork">
                  <node TEXT="不影响用户登录状态，刷新页面后，会展示修改后角色权限对应的模块" ID="2b9058697dae62b6eaab0b5dcfc7c47a" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="姓名修改后" ID="ef49afea548add3e8176f6fcf1d94d41" STYLE="fork">
                <node TEXT="页面右上角会变更为修改后的姓名" ID="aa63cfe00a0c54e1d0cacafc0e4e7453" STYLE="fork"/>
                <node TEXT="任务管理中若之前被指派过任务，人员姓名会随之变更" ID="cb2a9eec5f64a0253676adb2f2fe7dd5" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="【重置密码】" ID="d4237f05149c53bd32a2333d7d1cac36" STYLE="fork">
            <node TEXT="二次确认" ID="9ea1900b17e482555379b0b975a07fff" STYLE="fork">
              <node TEXT="确定重置 [姓名] 的密码吗？" ID="262df93391e8ce3fe154ee733523659b" STYLE="fork">
                <node TEXT="【取消】" ID="60c4e7ed007485ed990456aca322e1b0" STYLE="fork">
                  <node TEXT="关闭弹窗" ID="d4ed6b179bbe12c9d3807f18819067ef" STYLE="fork"/>
                </node>
                <node TEXT="【确定】" ID="cedded67fcf67a3fb83058bf1f3d0e37" STYLE="fork">
                  <node TEXT="该账号的密码重置为123456" ID="f99209c885e8113f9d18bd35cbd46438" STYLE="fork"/>
                  <node TEXT="已登录的用户不影响使用" ID="31a84b006203dc8a865e38c92b28bb26" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="【启用】/【禁用】" ID="b8cbdc6c67d9348a0364f13ab1af461a" STYLE="fork">
            <node TEXT="点击启用，账号状态为“启用”，可以正常登录使用" ID="5545416dc434b43fc3300de992cccc98" STYLE="fork"/>
            <node TEXT="点击禁用，账号状态为“禁用”" ID="05b3b1233de33fc2c4b9dc900b79166b" STYLE="fork">
              <node TEXT="未登录状态" ID="c7255f48811f0d93c0e499d6c02feaa6" STYLE="fork">
                <node TEXT="用户登录时，提示：“账号或密码错误，或账号已被禁用”" ID="f12f9aed120ef2a0bca7ed6ad214cd75" STYLE="fork"/>
              </node>
              <node TEXT="已登录状态" ID="ef2d61ba4b2fb4840cc09da11afe333c" STYLE="fork">
                <node TEXT="任意点击页面菜单，用户会被登出，回到登录页" ID="e3c9288744b3ced86a8bd4244e277367" STYLE="fork"/>
              </node>
              <node TEXT="任务管理被指派时，对应下拉不展示禁用的用户" ID="67d5b71701558132662e3dc81583b977" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【删除】" ID="9c5e4f5d1259de686eb60209b80faa21" STYLE="fork">
            <node TEXT="二次确认" ID="fcaf4dc2a23e0ac0fb8a640355db0644" STYLE="fork">
              <node TEXT="确定删除 [姓名] 吗？" ID="2d9ffa528dfdd073e4f691c7fd6f8423" STYLE="fork">
                <node TEXT="【取消】" ID="6415e1390cf181bc150bc8857c7563ba" STYLE="fork">
                  <node TEXT="关闭弹窗" ID="ee045a42612923e6975d5d8e702eef0c" STYLE="fork"/>
                </node>
                <node TEXT="【确定】" ID="1b06b9c06d506b14e794e3184b354add" STYLE="fork">
                  <node TEXT="提示：“删除成功”" ID="7e652921d6d3d93fd83b516cf7d6565c" STYLE="fork"/>
                  <node TEXT="校验" ID="ae49bb056462e07f5ab92871cf3bf409" STYLE="fork">
                    <node TEXT="再任务管理已被指派任务的账号，不允许删除" ID="6beaadf1db6df07d7ecf91eaf6d15d9d" STYLE="fork">
                      <node TEXT="提示：“该账号已被指派任务，不允许删除”" ID="9d7c9151fdbbd5fedb471ecdb0642b21" STYLE="fork"/>
                    </node>
                    <node TEXT="未登录状态" ID="690508a74cce1dd745060c63d767f1a3" STYLE="fork">
                      <node TEXT="用户登录时，提示：“账号或密码错误，或账号已被禁用”" ID="8cd504783db006d842d50fa91adcc253" STYLE="fork"/>
                    </node>
                    <node TEXT="已登录状态" ID="38d90862a5fe766a3462773654da044e" STYLE="fork">
                      <node TEXT="任意点击页面菜单，用户会被登出，回到登录页" ID="69b1107335fd61b674ff7f9d29dffd2d" STYLE="fork"/>
                    </node>
                    <node TEXT="任务管理被指派时，对应下拉不展示删除的用户" ID="1f9501a847b6753eabde0604e073478f" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="排序" ID="22014c5ba15ce2b0b999417744a5b2a7" STYLE="fork">
          <node TEXT="按创建时间倒序" ID="afd40be014238e73b744b76060392567" STYLE="fork"/>
        </node>
      </node>
    </node>
    <node TEXT="角色管理（封伟）" ID="adc190120fc80a8d2c501439467597ce" STYLE="bubble" POSITION="right">
      <node TEXT="列表页" ID="5cca9186ee069afab06704d1cf7dbdc8" STYLE="fork">
        <node TEXT="角色编码、角色名称、描述、状态" ID="363ed49f5f1983c262c9ab2696e91708" STYLE="fork">
          <node TEXT="admin" ID="b8001966e9b4490d8e8517011717f144" STYLE="fork">
            <node TEXT="管理员" ID="b18491ffd5f483a37874e2370b8ecad8" STYLE="fork">
              <node TEXT="所有权限" ID="0211819a90db3c18d74f0319a5ea3357" STYLE="fork">
                <node TEXT="启用" ID="767dce7cbeed9082920733b0fd1faa08" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="algorithm_engineer" ID="0f4dc1ce32de02945465ab69406ea6d3" STYLE="fork">
            <node TEXT="算法工程师" ID="b3f2b1e9059fadaed9cf71d22d0fc88e" STYLE="fork">
              <node TEXT="工作台、任务管理、数据转换、数据可视化权限" ID="623e97ae3249a847a7d94b6818563455" STYLE="fork">
                <node TEXT="启用" ID="cebffb36a2b1513a03dbf7079820df32" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="collection_engineer" ID="571db852916c36d7032ed3dfbc8571c2" STYLE="fork">
            <node TEXT="采集工程师" ID="bc0947a50e869ad0cba5d985b68e64ca" STYLE="fork">
              <node TEXT="工作台、我的采集权限" ID="4484b51198c151966d558023a8e247f0" STYLE="fork">
                <node TEXT="启用" ID="b53f2e1f0aa5ca66cd31f7172f8c1c2d" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="annotation_engineer" ID="4e56435a44188dea0b58777ef63f816a" STYLE="fork">
            <node TEXT="标注工程师" ID="09cd99f5c014fe4990b1377c3f4b0150" STYLE="fork">
              <node TEXT="工作台、我的标注权限" ID="b973c7ccca2cf77b761d61e738f32e11" STYLE="fork">
                <node TEXT="启用" ID="25541033567b3ef81cdec4d55abe99c8" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="qc_engineer" ID="f8a7f6270bbd0eb0f4f02ffe0221e893" STYLE="fork">
            <node TEXT="质检工程师" ID="026a55eeac0b0b9c1ba135e93b7bb845" STYLE="fork">
              <node TEXT="工作台、我的质检权限" ID="df23abb6d5e45e39b2f4720a0bce7dc1" STYLE="fork">
                <node TEXT="启用" ID="5671d3ba8d4fbd5cf2d7956d257a4ae7" STYLE="fork"/>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="角色目前写死，不允许增删改" ID="f22853b40c31ecf2951752933188ea49" STYLE="fork"/>
      </node>
    </node>
    <node TEXT="标签管理（林禹成）" ID="8d14fa31bf589dfeca463569f666bd54" STYLE="bubble" POSITION="right">
      <node TEXT="查询" ID="51d1786cae25ade2d2145158cd6abd61" STYLE="fork">
        <node TEXT="标签名称[输入框]" ID="928be6d89993adb77afe03ba82472cc4" STYLE="fork">
          <node TEXT="支持模糊搜索" ID="9437c1628b590ed04b35bdaba5278c7e" STYLE="fork"/>
        </node>
        <node TEXT="标签分类[下拉框]" ID="785d8d65a97324ba10629330b04b813d" STYLE="fork">
          <node TEXT="质量" ID="c1f3c177e3b4b86e64559097d3670925" STYLE="fork"/>
          <node TEXT="其他" ID="e6b3795c0088e501f1ed6329a229fd52" STYLE="fork"/>
        </node>
        <node TEXT="状态[下拉框]" ID="db308905a6c6a68404fa23f40f09509b" STYLE="fork">
          <node TEXT="启用" ID="82c2c80f439a3ff978271bc537ee4f42" STYLE="fork"/>
          <node TEXT="禁用" ID="846c4e7095770f2fda550f1c7dd59e48" STYLE="fork"/>
        </node>
        <node TEXT="【查询】" ID="3de04f47f49d26f8c32e49ae432b0ce4" STYLE="fork"/>
        <node TEXT="【重置】" ID="3cd46ef243d6837acd6fbc113022d664" STYLE="fork">
          <node TEXT="回到默认为空，进行查询" ID="e8ea6b0d5549f16d1111f15836a17bd6" STYLE="fork"/>
        </node>
      </node>
      <node TEXT="【新建标签】" ID="b2b9e5949dea6120b06bfa7358f88b3f" STYLE="fork">
        <node TEXT="* 标签名称" ID="8156d6dcc2ef3800a4a80c995739b906" STYLE="fork">
          <node TEXT="限制" ID="6116f0554771fa294b6de5684de4ca55" STYLE="fork">
            <node TEXT="长度 [1,32]" ID="ca9b96b298d9f6f99b1e2e3d5d135efd" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字" ID="7527c1ee83994d92a856f1eedf4024d1" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="* 标签分类" ID="02bad2b1d03f6d672e4399fb790d99f6" STYLE="fork">
          <node TEXT="其他" ID="379afa87f6ae5123128b7d23d5a7cd5f" STYLE="fork">
            <node TEXT="默认" ID="5a0d3bf09e0586194ff72f94942af411" STYLE="fork"/>
          </node>
          <node TEXT="质量" ID="d688015f6fd2b76d2fcc145e10e65a75" STYLE="fork"/>
        </node>
        <node TEXT="【取消】" ID="6462572c372b940c2ad129886b020eb0" STYLE="fork">
          <node TEXT="关闭弹框，不保存" ID="1ff2f38d4c2035e1a3a94132ea358f8c" STYLE="fork"/>
        </node>
        <node TEXT="【保存】" ID="791653046a82e8dce57ea7732546a28a" STYLE="fork">
          <node TEXT="校验" ID="ec19bdbe1f520f3c48370029e3fab265" STYLE="fork">
            <node TEXT="必填项校验" ID="9f408b522b0a6a5fdbb638d3072917bd" STYLE="fork">
              <node TEXT="对应输入框前端报红提示" ID="c6a73fa97750b5ee5fffa1c14f93c1c9" STYLE="fork"/>
            </node>
            <node TEXT="标签名称唯一性校验" ID="a778d85db5873210fefb3979b4801c36" STYLE="fork">
              <node TEXT="提示：“标签名已存在”" ID="c4c2bb69da16ddaaed72adccc0fd91e4" STYLE="fork"/>
            </node>
          </node>
        </node>
      </node>
      <node TEXT="列表页" ID="387973153cd05322827782405115890c" STYLE="fork">
        <node TEXT="标签名称" ID="a68c03ad96a9e309bb7928f2fc775337" STYLE="fork">
          <node TEXT="新增时填写的标签名称" ID="da2a23f64c4afa4ae772d00de310773d" STYLE="fork"/>
        </node>
        <node TEXT="标签分类" ID="472b7c8e54e67ad0586bb793c22f330c" STYLE="fork">
          <node TEXT="新增时选择的标签分类" ID="860e4dd74e6b86925fa5b70172658260" STYLE="fork"/>
        </node>
        <node TEXT="状态" ID="9232c62b2fffbe129ff35a34097773e1" STYLE="fork">
          <node TEXT="启用" ID="8265de0f68ebf1d721b0d55e20224003" STYLE="fork"/>
          <node TEXT="禁用" ID="96304a5adf4c11357722a5b9b9e621bb" STYLE="fork"/>
        </node>
        <node TEXT="创建时间" ID="dc7de4c583c735ef91f7e9f344e0a045" STYLE="fork">
          <node TEXT="显示：年月日 时分" ID="146fb1a055aef6ee4fe89559a4f290c5" STYLE="fork"/>
          <node TEXT="新增标签时的时间，不会更新" ID="da669f4c8771e882d9d96d9b959377e4" STYLE="fork"/>
        </node>
        <node TEXT="更新时间" ID="910e1f9f494b421c7183fccad04e046d" STYLE="fork">
          <node TEXT="显示：年月日 时分" ID="dc12728c3103935ea85f645e7a6d9b3b" STYLE="fork"/>
          <node TEXT="编辑、禁用操作时，会更新更新时间，刚创建时与创建时间一致" ID="a77f741ed2315df37e4d06311630cf5d" STYLE="fork"/>
        </node>
        <node TEXT="操作" ID="e232191b79c1cd84d564a8e6fd165939" STYLE="fork">
          <node TEXT="【编辑】" ID="5c67e29f41797bb27a6ffc82abd990bb" STYLE="fork">
            <node TEXT="标签名称回显，可修改" ID="3417d59cf5f7d871c4667b1371d4d658" STYLE="fork">
              <node TEXT="限制" ID="0170a1939389be42bdcaa3fef82c794b" STYLE="fork">
                <node TEXT="长度 [1,32]" ID="b2e4171295f95f3edf2093fa0635f0c5" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字" ID="612d760131c7960c95ce821853020ff0" STYLE="fork"/>
              </node>
              <node TEXT="标签名称唯一性校验" ID="826f615cea5e7d29d15021156f944ad4" STYLE="fork">
                <node TEXT="对应输入框前端报红提示" ID="d2c32ea35185085b84bfde72b834dfe8" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="校验" ID="57e9a83e0afbe8653e5f2c57c9b19eb9" STYLE="fork">
              <node TEXT="已被任务使用的标签，不允许编辑" ID="69a4010e3c112ee73cd35871e6ea943e" STYLE="fork">
                <node TEXT="提示：“标签已被任务使用，不允许修改”" ID="86986a29b8b55ad99caf9b8598d45db5" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="【禁用】/【启用】" ID="0e017c5146c17ef8276e9ac8e985f2c0" STYLE="fork">
            <node TEXT="校验" ID="4720f3cae529f0451c3196ae6156913f" STYLE="fork">
              <node TEXT="已被任务使用的标签，不允许禁用" ID="d1af8dae5dee4aab8fc83dff13572f9d" STYLE="fork">
                <node TEXT="提示：“标签已被任务使用，不允许禁用”" ID="33bd73beca9c6fc23b5e88dfc82db244" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="【删除】" ID="29df5457e9822053686defa548b12fe6" STYLE="fork">
            <node TEXT="二次确认" ID="3e5e063d2dc0af8d3e9ed63cfb2cc336" STYLE="fork">
              <node TEXT="确定删除标签「标签名称」吗？" ID="744fca010d1de4cc0e2abc967690f444" STYLE="fork"/>
            </node>
            <node TEXT="校验" ID="8143bc94296b82ba441f782c0457bced" STYLE="fork">
              <node TEXT="已被任务使用的标签，不允许删除" ID="2b9d5b990f31e0b5ab979c04e40516b5" STYLE="fork">
                <node TEXT="提示：“标签已被任务使用，不允许删除”" ID="4691dd0497ad2033bf0ede34137c27bb" STYLE="fork"/>
                <node TEXT="标签已被任务使用，不允许禁用" ID="af37235c3ac73d6bfc034b092e52c538" STYLE="fork"/>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="排序" ID="084f8d7e046c8a9f17b33a4ab5df3f6e" STYLE="fork">
          <node TEXT="创建时间倒序" ID="43301ccd0ef444b5978041662121ed32" STYLE="fork"/>
        </node>
      </node>
    </node>
    <node TEXT="机器人构型配置（林禹成）" ID="c579106df851a532b5a66e09b792a0b1" STYLE="bubble" POSITION="right">
      <node TEXT="【新建机器人构型】" ID="27b17c54ede5e402884a35d9ba38d511" STYLE="fork">
        <node TEXT="* 构型名称" ID="bfd5ac82f4e986c826fe3a1a665f23d6" STYLE="fork">
          <node TEXT="限制" ID="bf89cd62fbc7133af6e53efbbc89c053" STYLE="fork">
            <node TEXT="长度 [1，32]" ID="2bc4becc78f2d11785d51322d0c8b3f7" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字、_" ID="6ecd101834513d4f6a9bbd97b1d565cb" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="* 机器人型号" ID="5395c9ff0b5063bb00456b75708ea9a6" STYLE="fork">
          <node TEXT="限制" ID="a0c9c549d09c45c7497135ead2ca2af6" STYLE="fork">
            <node TEXT="长度 [1，32]" ID="5bb19140e941ea18021ad3ea055bbe2d" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字、_、-" ID="07bced00faae739795fab1177bbf96d8" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="描述" ID="42e703bcc366296222e2b180eebca3c8" STYLE="fork">
          <node TEXT="限制" ID="feddd3adf55f3751682b15cb8176b78c" STYLE="fork">
            <node TEXT="长度&lt;=255" ID="16a1bece783b5ae3fdc537a36f9d5b2c" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="* 配置文件" ID="98a661ae94aa91e935acec374d4d7192" STYLE="fork">
          <node TEXT="仅支持 .json 格式，配置 JSON 必须包含 robot_type 字段" ID="34641765622f7b693ebf93ab51df7d2e" STYLE="fork"/>
        </node>
        <node TEXT="【取消】" ID="af704efb1eb34ecd6913d47e822e4d88" STYLE="fork">
          <node TEXT="关闭弹框，不保存" ID="0de0281499dd37e22f314355662b52b7" STYLE="fork"/>
        </node>
        <node TEXT="【保存】" ID="32bfbb200fc9402ec9894bf6b2751b52" STYLE="fork">
          <node TEXT="校验" ID="b55bf392e8e4f363e3f9a39afb92f587" STYLE="fork">
            <node TEXT="必填项校验" ID="706b2bc68a29870fc6ebc6fe4156c8df" STYLE="fork"/>
            <node TEXT="构型名称唯一性校验" ID="2d5b281e99608cb99951f7d86759a2dd" STYLE="fork">
              <node TEXT="提示：“构型名称已存在”" ID="e2211a53cdc6cca4581da82049740d19" STYLE="fork"/>
            </node>
          </node>
        </node>
      </node>
      <node TEXT="列表页" ID="801fe1fe14772dab3df336d5aa520d17" STYLE="fork">
        <node TEXT="构型名称" ID="0ba78233ddb29d346a5b13fdceea6751" STYLE="fork">
          <node TEXT="新增时填写的一致" ID="f70e785c60787d8422752808c49c13e5" STYLE="fork"/>
        </node>
        <node TEXT="机器人型号" ID="63e039ac8d3ca3fe862a4d7b286b204d" STYLE="fork">
          <node TEXT="新增时填写的一致" ID="b73db97d98bfe0b85b63a252c23728f8" STYLE="fork"/>
        </node>
        <node TEXT="描述" ID="5ae32d50ebafac66118c57f816293d1a" STYLE="fork">
          <node TEXT="新增时填写的一致" ID="37e4da809fceff5fa95d4e7600de1fa8" STYLE="fork"/>
        </node>
        <node TEXT="配置文件" ID="be660e49eed5d90545e58755ce342fc5" STYLE="fork">
          <node TEXT="新增时上传的json文件名称" ID="03c8cbe6533d78663caa028180c1fbac" STYLE="fork">
            <node TEXT="可点击查看" ID="06c0ec0e8e3a581925b0e7359979cff0" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="创建时间" ID="d8b3d614bd8f0339ee0d6d806578a928" STYLE="fork">
          <node TEXT="显示：年月日 时分" ID="6ead3baa6f5bd8aad1019262069b7c6f" STYLE="fork"/>
        </node>
        <node TEXT="操作" ID="2856513cb988108b49272d2ecabfb20a" STYLE="fork">
          <node TEXT="【查看】" ID="e6c339c0c12d1128830a2a28af7feeb2" STYLE="fork">
            <node TEXT="可查看json文件内容" ID="a0b07830f77df819af55fc9b26aa8d01" STYLE="fork"/>
          </node>
          <node TEXT="【删除】" ID="1121b35b500dcbe7cf90f01f3bf85544" STYLE="fork">
            <node TEXT="二次确认弹框" ID="672333784b385400ff7911a038e2ab87" STYLE="fork">
              <node TEXT="确定删除构型「构型名称」吗？" ID="6d51135cf3873ba104775c1f03837692" STYLE="fork">
                <node TEXT="【取消】" ID="8b06907161c1db3e733f52f569c9a6eb" STYLE="fork">
                  <node TEXT="关闭弹框" ID="1628b956e1d57c354ac998e979b57e8c" STYLE="fork"/>
                </node>
                <node TEXT="【确定】" ID="637e5b6d2d692ba28fa3a3205f2c88ad" STYLE="fork">
                  <node TEXT="校验" ID="14156ff9e976ee60f0ade744174cba7e" STYLE="fork">
                    <node TEXT="已被任务使用的机器人构型，不允许删除" ID="be781097542e4bf3927f74483df8b037" STYLE="fork">
                      <node TEXT="提示：“构型已被任务使用，不允许删除”" ID="93859ac7bc01bb895813bde9f9d56476" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
    </node>
    <node TEXT="数据分类管理（林禹成）" ID="ab829fb3987549626734039577931c81" STYLE="bubble" POSITION="right">
      <node TEXT="【新建分类】" ID="f0d7c66bd215ac763fed1aa0b95bf02a" STYLE="fork">
        <node TEXT="* 分类编码" ID="f459c6c71809ecb9f47b579e5197c614" STYLE="fork">
          <node TEXT="限制" ID="50e1b35b4c73de1d9625795650d059ba" STYLE="fork">
            <node TEXT="长度 [1，32]" ID="53ff10b5272231ed1c46673e527d7288" STYLE="fork"/>
            <node TEXT="仅支持英文字母、数字、_" ID="3e9af77c57580ff5406c23af16576d01" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="* 分类名称" ID="d9febbe283bf7d363f8f8aa2631861cf" STYLE="fork">
          <node TEXT="限制" ID="9294422bc93caafb2d19a8851ff6a6bf" STYLE="fork">
            <node TEXT="长度 [1，32]" ID="1e856a0851ad328bb112d725a7e78685" STYLE="fork"/>
            <node TEXT="仅支持中英文字母、数字" ID="f2d87171bbb97621ab7d60c5eb8afa39" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="【取消】" ID="56c864668b221cfff978c77b0dc259b7" STYLE="fork">
          <node TEXT="关闭弹框，不保存" ID="22457ec1c35297d9c9c32929048f4a60" STYLE="fork"/>
        </node>
        <node TEXT="【保存】" ID="874400bca1ecebec993e69f28d5c57a9" STYLE="fork">
          <node TEXT="校验" ID="9b07730bbf89593c09f7f8fb2a3cbcb8" STYLE="fork">
            <node TEXT="必填项" ID="e74ad6ee626693ad14ee099e4c80f91c" STYLE="fork"/>
            <node TEXT="分类编码唯一性校验" ID="be3647aef9b38200e317d0ab0aa45dd3" STYLE="fork">
              <node TEXT="提示：“分类编码已存在”" ID="b5003e2abd8f7e843958c1179438a7e1" STYLE="fork"/>
            </node>
            <node TEXT="分类名称唯一性校验" ID="ed59f8a5708e7f46d6ae86bdc7817802" STYLE="fork">
              <node TEXT="提示：“分类名称已存在”" ID="ca82fcf2f71f73fcb267368dc47ffce8" STYLE="fork"/>
            </node>
          </node>
        </node>
      </node>
      <node TEXT="列表页" ID="0a29c1f1b389cf7b6248b62a57ad3e69" STYLE="fork">
        <node TEXT="分类编码" ID="7ff09bdb72caec37d1e49ece2ef803b1" STYLE="fork">
          <node TEXT="新增时填写的一致" ID="3ab5c196f8fa010dbe7b37d281d92411" STYLE="fork"/>
        </node>
        <node TEXT="分类名称" ID="dc8d9c86284e844cd7becc7b2b7e10bd" STYLE="fork">
          <node TEXT="新增时填写的一致" ID="1293d9041deda8bcd790cec09ae208e9" STYLE="fork"/>
        </node>
        <node TEXT="创建时间" ID="0471541fd71a74aecf0d6b2bbe6f1e71" STYLE="fork">
          <node TEXT="显示：年月日  时分" ID="3543cc2b7b52591ebe3294e2a1d3392c" STYLE="fork"/>
        </node>
        <node TEXT="操作" ID="6e7656037c15c79a1018d54319a889c2" STYLE="fork">
          <node TEXT="【编辑】" ID="74e88c27a125d420e7edb1a5b853a4c4" STYLE="fork">
            <node TEXT="* 分类编码" ID="5ea4e8032b335b0697d5a62184069da4" STYLE="fork">
              <node TEXT="置灰，不允许修改" ID="7687bc5438b47401f9609cf6f1dacbd7" STYLE="fork"/>
            </node>
            <node TEXT="* 分类名称" ID="51fcf1e90b32de3bbadd100264cf35b8" STYLE="fork">
              <node TEXT="回显可修改" ID="01d14d643cd3c5b8a855978728959df7" STYLE="fork"/>
              <node TEXT="限制" ID="7ecc175373181ce09a4c2d70ce54fb27" STYLE="fork">
                <node TEXT="长度 [1，32]" ID="2eb89c2852b58720a7c2920d280c8598" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字" ID="d6d3f19d45c4d21f00b62005eca5be3a" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="【取消】" ID="f6bb8bdd0d67c2a93c2474a7d4f48363" STYLE="fork">
              <node TEXT="关闭弹框，不保存" ID="603582ab383bf419105dac9bef6f0e3b" STYLE="fork"/>
            </node>
            <node TEXT="【保存】" ID="a367381ed9e9424e19588dd153e24e70" STYLE="fork">
              <node TEXT="校验" ID="5504fbee62950a63eb82a514887cb18f" STYLE="fork">
                <node TEXT="必填项" ID="3c2e47a4cfcd63f896a6b8f2c4755631" STYLE="fork"/>
                <node TEXT="分类名称唯一性校验" ID="e2a39c56873637e21de4f09aeba31a1c" STYLE="fork">
                  <node TEXT="提示：“分类名称已存在”" ID="bceedd660908e4fd48c67bff0b570fb3" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="【删除】" ID="0156035ef129bb01fb8c00b689899c16" STYLE="fork">
            <node TEXT="二次确认“确定删除分类「分类名称」吗？”" ID="af9f8908f607fb7b247d4c2c522e623e" STYLE="fork">
              <node TEXT="【取消】" ID="6a0fed472731fa8fd5d904d6cd7b0240" STYLE="fork">
                <node TEXT="关闭弹框" ID="a3b232e568ab7ec0ed4b0312e630b71d" STYLE="fork"/>
              </node>
              <node TEXT="【确认】" ID="8d3e6622ac5e2b7c2852dc1f062fba30" STYLE="fork">
                <node TEXT="校验" ID="34489fcfb9eb8c6069b23716032b821f" STYLE="fork">
                  <node TEXT="已被任务使用的分类，不允许删除" ID="5ab82cf3d9c6fd88fa1d30ee8d7f239e" STYLE="fork">
                    <node TEXT="提示：“分类已被任务引用，不能删除”" ID="ebcec0e04dd3032fe2b8249c533ff6c1" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
    </node>
  </node>
</map>