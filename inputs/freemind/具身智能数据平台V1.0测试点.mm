
<map>
  <node ID="root" TEXT="具身智能数据平台V1.0需求测试点">
    <node TEXT="端侧" ID="158361161f5324b2b33a58257660d88c" STYLE="bubble" POSITION="right">
      <node TEXT="打开APP" ID="d3c9ea4f1f6769119ccbb01697441986" STYLE="fork">
        <node TEXT="未连接机器人" ID="85f974d22c80666ea59e5fa757f7f724" STYLE="fork">
          <node TEXT="机器人连接页（林禹成）" ID="b4bae2f348ead3fd55b59766673fb580" STYLE="fork">
            <node TEXT="常驻顶栏" ID="55a4cc088ae193939029d57fa07af35a" STYLE="fork">
              <node TEXT="未连接机器人·点击设置" ID="c0364a8443b2c5fb60f464645947ceb5" STYLE="fork">
                <node TEXT="点击弹出“设置”弹框" ID="7b91f472333cb1637e5b9f4e33463eea" STYLE="fork">
                  <node TEXT="基本设置" ID="1f5a1bb4df82674746aac26a25e08710" STYLE="fork">
                    <node TEXT="机器人IP" ID="6b507f4aea4cbf48a3e7566678ce0cb1" STYLE="fork">
                      <node TEXT="默认：192.168.0.25" ID="4dce8c7e5d5530591301f0a0f32b7b57" STYLE="fork">
                        <node TEXT="可任意修改" ID="2cb5486ff922360a70467f04ddd4040e" STYLE="fork"/>
                      </node>
                      <node TEXT="自动回显上次连接成功的IP" ID="c26b576cdbb7d9417464568a48bbda28" STYLE="fork"/>
                    </node>
                    <node TEXT="文案：打开 App 会按这个地址自动连接。改完保存即重新连接。" ID="c218d30457848aa13d714f0b6715ca0b" STYLE="fork"/>
                    <node TEXT="文案：开机自动打开 App、自动连接上次机器人、没网读本地任务。采集中不能改 IP。" ID="9ea65d7572b385858c62362889198452" STYLE="fork"/>
                    <node TEXT="【保存并连接】" ID="d6d358ef49ae2b7d1b15250fae189c51" STYLE="fork">
                      <node TEXT="连接失败" ID="8734b61f25d7c125281019573b7373ce" STYLE="fork">
                        <node TEXT="文案：无法连接机器人                                                                 已按上次保存的 IP 自动连接，但机器人没有响应。确认上电和网段后，再保存连接。" ID="67e2eafd7f6e01c1e5dc14267b018d20" STYLE="fork"/>
                        <node TEXT="报红提示：连不上 xxx.xxx.x.xx                                                       机器人无响应。检查已上电、和平板同一网段、IP 是否写对。" ID="b41394dbb0f5085b565c118f8c80cc6a" STYLE="fork"/>
                      </node>
                      <node TEXT="连接成功" ID="6a81237face3d8b51ca12bd4c094fd8f" STYLE="fork">
                        <node TEXT="保存本次连接的IP" ID="4c5f650a4fb006b5eee49ed1a6a86b8d" STYLE="fork"/>
                        <node TEXT="进入对应的模式页面" ID="309429d58f78dda121cebb85d6360e3a" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="进程管理" ID="343f82a91ef6b467aef47b7a86cfb42d" STYLE="fork">
                    <node TEXT="为空" ID="c55b9207bb57d347cc9addea21266f78" STYLE="fork"/>
                  </node>
                  <node TEXT="日志查看" ID="d865e22a69c1c1f58c8987e38d22bcce" STYLE="fork">
                    <node TEXT="为空" ID="9279bd53be36022d5433e099785de054" STYLE="fork"/>
                  </node>
                  <node TEXT="设备状态" ID="74e2f6b27537beeda60fa64b60ceeebf" STYLE="fork">
                    <node TEXT="为空" ID="0c8f4c8bfde077b50d0aa209588dc024" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="机器人IP输入连接区域" ID="b814b6c04e23b452e37d4e9554a5f92d" STYLE="fork">
              <node TEXT="机器人IP" ID="433c2cd8a8bfe13706619204a7a8c4db" STYLE="fork">
                <node TEXT="默认：192.168.0.25" ID="74f8c1a63e3335dc792aeea8dc24179d" STYLE="fork">
                  <node TEXT="可任意修改" ID="d5ce5799dbc639e0d9de16359baa5174" STYLE="fork"/>
                </node>
                <node TEXT="自动回显上次连接成功的IP" ID="df669501369f5b0d16c6a7f05180c67e" STYLE="fork"/>
              </node>
              <node TEXT="【保存并连接】" ID="2e42080dc8ffd6905b634deb5c9fcc87" STYLE="fork">
                <node TEXT="校验" ID="1267ce236ec1fc8254adaf427abae816" STYLE="fork">
                  <node TEXT="连接 / 设置" ID="6e96e95ef5e0046bf4abe0b604458ccb" STYLE="fork">
                    <node TEXT="IP格式校验:输入空段、超出0-255或格式错误,点【保存并连接】提示&quot;IP地址格式不正确。四段都要填写,每段0–255&quot;,不发起连接" ID="d1687918b27e94781208fecd361c46a2" STYLE="fork"/>
                    <node TEXT="连接失败弹窗:IP格式错/超时/无响应时弹窗报错,同时保留红字内联提示;点【确定】留在当前页,可修改IP重试" ID="bc43092564803c65c1e1f1ddb75e9986" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="连接失败" ID="d658aa937afdbdd65686f8b23aa7668d" STYLE="fork">
                  <node TEXT="文案：无法连接机器人                                                                 已按上次保存的 IP 自动连接，但机器人没有响应。确认上电和网段后，再保存连接。" ID="ffa8ee09e62bdfd037e1e5fabd0ec9ee" STYLE="fork"/>
                  <node TEXT="报红提示：连不上 xxx.xxx.x.xx                                                       机器人无响应。检查已上电、和平板同一网段、IP 是否写对。" ID="fc18e888b2e1ec2d1dacff20eccff43d" STYLE="fork"/>
                  <node TEXT="【保存并连接】按钮变更为【重新连接】" ID="ebcb1f902ab908e300b29f052339f535" STYLE="fork"/>
                </node>
                <node TEXT="连接成功" ID="b55fc8ea7de29980ae7174dcb4ef1770" STYLE="fork">
                  <node TEXT="保存本次连接的IP" ID="c355b5cdef86074a687b67048c535dac" STYLE="fork"/>
                  <node TEXT="进入对应的模式页面" ID="dee0c3bf44aeca36831454ef2e7dc9a1" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="已连接机器人" ID="b252c45fabc173b2f621adc6652816bd" STYLE="fork">
          <node TEXT="数据采集（林禹成）" ID="87f6e806cadc7f66234fecb7cb2d67cd" STYLE="fork">
            <node TEXT="对应机器人的采集模式" ID="c5b4d5d85904d23496782a6969b27867" STYLE="fork">
              <node TEXT="自动起 VR、夹爪、双臂、相机、底盘" ID="82f67bf5ba4e33ba1747f7528a84eb5f" STYLE="fork"/>
              <node TEXT="启动服务Loading:进入采集页显示&quot;正在启动服务&quot;+副标题&quot;机械臂·底盘·VR·四路相机&quot;,约1.5s后进入采集页" ID="bd84a8a80d47a705b1d4217f58f36ca0" STYLE="fork"/>
              <node TEXT="离开延迟60s杀服务:离开采集/手动模式页面延迟60s杀服务,60s内回来复用,超时全停;采集中不杀进程" ID="54acaab4581eda85aafd6b77aab2e522" STYLE="fork"/>
            </node>
            <node TEXT="常驻顶栏" ID="85a0e0ff16229f39d07c4d7fa7f87885" STYLE="fork">
              <node TEXT="Tab高亮选中“数据采集”" ID="94ae2b5c4af8f3d9b236dc4668f4bfa7" STYLE="fork">
                <node TEXT="未采集时，可切换“查看数据”和“手动模式”" ID="f8c8a207930ce6888fbc2d9682ccecaa" STYLE="fork"/>
                <node TEXT="采集中时，禁用tab切换" ID="fbd73fd36529e8d6b31e565c59f23a13" STYLE="fork"/>
              </node>
              <node TEXT="显示" ID="561768a5502a59a4ae1786cb2f9f75af" STYLE="fork">
                <node TEXT="VR" ID="7975bf13679832c09dc0e6fc31e20bca" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="a4a0947eecb556fec5c2bb120d4165de" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="47adf31bdf8a77f83479dae30d6e6c66" STYLE="fork"/>
                </node>
                <node TEXT="夹爪" ID="b428451208190884963d129cbb5f9fe9" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="f2b3d348bea4261a7cf6c95ee343aef6" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="0247975a0a0a9a9b2b27dca2b0501f55" STYLE="fork"/>
                </node>
                <node TEXT="双臂" ID="98127c3a82201abce96153f7a3fb5201" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="095eb2b60be7392ec5faacc84d9b915b" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="e1827fd77f0b5a472d1c418fb1749107" STYLE="fork"/>
                </node>
                <node TEXT="相机" ID="e7c1a672f62769b745d2edec96ce6a42" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="006aa7dd795935cc53d8dac0fc26d088" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="25e97248ccb00c10f4f4d04a792338f8" STYLE="fork"/>
                </node>
                <node TEXT="底盘" ID="c992c3db6cbc3a60a62a55701a1b67b0" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="916e652a3eb7e5b2ff930fc94629ddfb" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="492abcaf041247d653bdaf5dc0490523" STYLE="fork"/>
                </node>
                <node TEXT="剩余 xxx GB" ID="81aa32981a7e7e68b612203523b17d8d" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="45ce6c774f11d0ba5ba1ac3417d9ba84" STYLE="fork"/>
                  <node TEXT="≥ 50GB" ID="867b95581351fc72e8a67cc656fa481d" STYLE="fork">
                    <node TEXT="显示：剩余 X GB" ID="c89468035fe053cbb05281ed009898f3" STYLE="fork">
                      <node TEXT="颜色：绿" ID="c9e7840de6dc482d93c7175835688b7b" STYLE="fork"/>
                      <node TEXT="采集正常" ID="87ad979c53c0c33956103d6164dd0a78" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="20 ~ 50GB" ID="17d5b3a69c48278adb1f4ac6d56d51cc" STYLE="fork">
                    <node TEXT="显示：剩余 X GB · 建议上传" ID="b08f93b84789634b7bc84ee5e830a282" STYLE="fork">
                      <node TEXT="颜色：黄" ID="28c1439a99c5b313b46efeb9922b2c8e" STYLE="fork"/>
                      <node TEXT="采集允许（提醒）" ID="83e9f62d0d720726a5732007e3175544" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="&lt; 20GB" ID="eaf9ac6ca997f6e22ae846f314c6de10" STYLE="fork">
                    <node TEXT="显示：存储不足 X GB" ID="0d3561b051e3df4a6e3fba297c9df03c" STYLE="fork">
                      <node TEXT="颜色：红" ID="e9e5b2c4fbb725cebaa40f88659f650d" STYLE="fork"/>
                      <node TEXT="数据采集tab下禁止开始新采集" ID="fed41e8cd483e074ffda6da58dbd2c45" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
              <node TEXT="【设置】" ID="bf214f15274bb303f5c2fc6a0fa52245" STYLE="fork">
                <node TEXT="点击弹出“设置”弹框" ID="38cd184ef24b67f80e2a3814cac8a028" STYLE="fork">
                  <node TEXT="【关闭】" ID="3b09804ccabacb5f7abb57c62a008c28" STYLE="fork">
                    <node TEXT="关闭弹框" ID="a72ec44b5bcec23b1c6fc96d42fa03d5" STYLE="fork"/>
                  </node>
                  <node TEXT="基本设置" ID="9389a4c03dd70944f15abcf9b6cd8da8" STYLE="fork">
                    <node TEXT="机器人IP" ID="5b0bc00bd21437595dab243d004fd643" STYLE="fork">
                      <node TEXT="回显机器人IP" ID="48e32244c83d49491e76430092a1160b" STYLE="fork">
                        <node TEXT="不允许修改" ID="68a2c81a70917df3a5568ed0d816f1ed" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="文案：打开 App 会按这个地址自动连接。改完保存即重新连接。" ID="5d7b1493a7429d8e0f687381c1461813" STYLE="fork"/>
                    <node TEXT="文案：开机自动打开 App、自动连接上次机器人、没网读本地任务。采集中不能改 IP。" ID="c469c676fe1cc2901d1713c96562af82" STYLE="fork"/>
                    <node TEXT="【保存并连接】" ID="0ed012afed7d571943de53a0f7f48ec8" STYLE="fork">
                      <node TEXT="置灰不允许点击" ID="810853b6dfce9e0b1a5544d83916bf9e" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="进程管理" ID="0c4f6573df37232a4d809c34ed080125" STYLE="fork">
                    <node TEXT="采集服务" ID="4300373b8257730375bbe89ade1284b0" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="9488f7bd673e0cccfa235cb9b9669c1f" STYLE="fork"/>
                    </node>
                    <node TEXT="设备连接服务" ID="9d922518ba5aae93ddf95b4cb84f72f6" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="85f5155ff26d255b598a9756871ff3ec" STYLE="fork"/>
                    </node>
                    <node TEXT="网络同步服务" ID="7735502c8478b0f22cc42a85ab84f771" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="7661e5b57533188e4334a1d826d65ace" STYLE="fork"/>
                    </node>
                    <node TEXT="数据存储服务" ID="6fa68233c407bce564a3c481cf813040" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="dda94445e2d3cab52f204fea4761a3ac" STYLE="fork"/>
                    </node>
                    <node TEXT="日志服务" ID="c1df2095061f7be633a787a3f8a49582" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="d0990b01b61e987f209373353ad36cc8" STYLE="fork"/>
                    </node>
                    <node TEXT="【启用】" ID="7a6176799cad986a090f8fa3c57e43b7" STYLE="fork">
                      <node TEXT="点击启用选中的服务" ID="e785adbdfa3eaefa15b05eb26b86d244" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="bc1fa934d081915d760c75828714e07a" STYLE="fork"/>
                    </node>
                    <node TEXT="【停止】" ID="c596b3033bd6a81e286c1754528b3053" STYLE="fork">
                      <node TEXT="点击停止选中的服务" ID="9126bf952286f25ee370f918949219a9" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="f28bb96e1387984373fe9018c876ba5c" STYLE="fork"/>
                    </node>
                    <node TEXT="【重启】" ID="89a07f6aa285bb81968c97fe2c99af2a" STYLE="fork">
                      <node TEXT="点击重启选中的服务" ID="a00d4a1d40fd5f947ee586c6629e996d" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="d83ab49845d399b862ffc9474853417a" STYLE="fork"/>
                    </node>
                    <node TEXT="测试服务异常时，状态显示正确" ID="0b9fe089a5e26862f8b70736aa8a3604" STYLE="fork"/>
                  </node>
                  <node TEXT="日志查看" ID="11dc4a6b73c4bb9f39aae8553089eed5" STYLE="fork">
                    <node TEXT="筛选" ID="2e12321c2fe70f255eef72dcfcfcdc42" STYLE="fork">
                      <node TEXT="全部时间" ID="d0c13eaff0716a48cac31a10bc117830" STYLE="fork">
                        <node TEXT="默认选中" ID="8730cb37544d2051e379061ebcd8a59d" STYLE="fork"/>
                      </node>
                      <node TEXT="最近1小时" ID="179ecb91ba5088ecd9716a447c41be2d" STYLE="fork"/>
                      <node TEXT="最近24小时" ID="6a2e8863dcec9162b010ae804ca6e841" STYLE="fork"/>
                      <node TEXT="最近7天" ID="d7d6bd75e3d184f81cb40af493a7cddf" STYLE="fork"/>
                    </node>
                    <node TEXT="操作日志" ID="cbddc9440d508e4aa28d09ad26b814a2" STYLE="fork">
                      <node TEXT="显示端侧系统内，点击操作的日志" ID="46f45191c16331fb2f37380cb3c0f56d" STYLE="fork">
                        <node TEXT="如：" ID="de753427d8a96462204a7bf28dec0596" STYLE="fork">
                          <node TEXT="[操作] 停止并保存 compact_shoes" ID="fc05254def1f76be1e8c73174a2619e4" STYLE="fork"/>
                          <node TEXT="[操作] 开始采集 compact_shoes" ID="d5f55d69ba1ab73f3e798fb5cdccd7df" STYLE="fork"/>
                          <node TEXT="[操作] 进入采集页" ID="b73e76af03311022ac7710893db8258f" STYLE="fork"/>
                          <node TEXT="[操作] 底盘移动 · 前进" ID="ef441b69d27c1e185f49225b23a44937" STYLE="fork"/>
                          <node TEXT="[操作] 手动控制 · 一键连接" ID="b0c1a87ef7fb6d46e4c9d80654920feb" STYLE="fork"/>
                          <node TEXT="[操作] 切换任务 · compact_shoes" ID="9aa1180d43d3949aafdd792de810e662" STYLE="fork"/>
                          <node TEXT="[操作] 切换人员 · 李四" ID="c32c75c99ab3040f79287d320471e270" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="操作数据量大时的展示正常" ID="d9819412831c30d6afb8016b590daf6b" STYLE="fork"/>
                    </node>
                    <node TEXT="【下载】" ID="8c403a5188975c95dd11dd3f862782a1" STYLE="fork">
                      <node TEXT="点击下载对应筛选项的操作日志" ID="87c5d1a15960e83e57e5519d22515d8e" STYLE="fork"/>
                      <node TEXT="文件名称：log_时间戳" ID="7cdf8b5dbf20f7ec4209565fbb37afc3" STYLE="fork"/>
                      <node TEXT="文件类型：.log" ID="5e718bab96cf617c5e7c152d4969dce3" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="设备状态" ID="625b95323b7288fa286425b60305d415" STYLE="fork">
                    <node TEXT="文案：各设备与服务的当前状态。待机时服务已停止，进入采集或手动控制时自动启动。" ID="ff1b0d36fcfde50eb527795797baecdd" STYLE="fork"/>
                    <node TEXT="机器人（工控）" ID="f1dcb6626e0750b1da62f1c031d59c24" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="9ae4cc20ac8f082e824a3258e21c24b4" STYLE="fork"/>
                    </node>
                    <node TEXT="双臂" ID="554e128a9e6f265360861368cdfe50b3" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="52389862c741745208a95b1748385ed3" STYLE="fork"/>
                    </node>
                    <node TEXT="夹爪" ID="3e8b2558dc44b1d8750c58bfbafc3fc5" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="b54b43a4203f972dfa3921e901a954b9" STYLE="fork"/>
                    </node>
                    <node TEXT="底盘" ID="5a01a628d0dd63b7b34227c52af25c5c" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="f27d7cfe05df9696f7f9c0e9747529cf" STYLE="fork"/>
                    </node>
                    <node TEXT="主视角相机" ID="e198c579b7c49483ca13d4271fb71430" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="e8f675169788f3bc476bdf57190ef72a" STYLE="fork"/>
                    </node>
                    <node TEXT="左腕相机" ID="5fca489395068d2ff66e114ce9bf499e" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="eef8110e0ed8856ddea47773bcf63f6f" STYLE="fork"/>
                    </node>
                    <node TEXT="右腕相机" ID="c2d48bbcd8f37705c0308d1c8326cff8" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="15f8a34d34fece1912adc3f5df1d9578" STYLE="fork"/>
                    </node>
                    <node TEXT="全景相机" ID="dc1f4ee0550c1b887edfdf977c41e2d1" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="1dad0b4e9ec44c3a59284dbcc8c092a8" STYLE="fork"/>
                    </node>
                    <node TEXT="机载存储" ID="aaf91eb995818671373d1d945de5914f" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="93ce0238996ef586dd3414eac24547f1" STYLE="fork"/>
                    </node>
                    <node TEXT="测试断电后，状态显示正确" ID="977de23342a19edc1582b5b4549a924a" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="数据采集" ID="581daf08e5044921948369742be42e47" STYLE="fork">
              <node TEXT="采集任务[下拉]" ID="22112ded453b50fbbf13cc21d81e8cf9" STYLE="fork">
                <node TEXT="端侧获取云端采集任务是在连接机器人时统一获取的" ID="6911fed1bba7ced83d0f6df15f30ada1" STYLE="fork"/>
                <node TEXT="获取云端采集中，下发给当前机器人的任务" ID="a752025e66128eb7ba6b284ed36a6915" STYLE="fork"/>
                <node TEXT="场景" ID="23249eb334514bccaf3551f9254f3ec2" STYLE="fork">
                  <node TEXT="当前任务状态在云端为“采集中”，端侧正在采集时，云端将状态变更为 “采集完成”" ID="3c57b64454e515fd046b7963a91f87ba" STYLE="fork">
                    <node TEXT="不影响端侧的采集" ID="d8b46bd4e41c5001bbc0e8cf4a780d8e" STYLE="fork"/>
                    <node TEXT="采集条数可以正常上报" ID="de897c0abe7acbf7170ff9feca7d11b2" STYLE="fork"/>
                    <node TEXT="采集人员可以正常切换" ID="ed0f16e0556e9b935b5a6803fbb59167" STYLE="fork"/>
                    <node TEXT="切换模式后，任务还是存在" ID="d5a1a7773bc9980c728ed6b8470f997d" STYLE="fork"/>
                    <node TEXT="杀掉APP重新连接后，任务不展示" ID="e7f2b923de866737e718c3dca48e750b" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="开始采集时，下拉禁止，不允许切换任务" ID="e2e335ec55f86a686d17e11ea0b5104b" STYLE="fork"/>
                <node TEXT="切换任务时，需要有二次确认提示：确认切换到任务「X」？切换后进入该任务的采集页" ID="5cbf681e851f76acee56da4fe58d5ebf" STYLE="fork">
                  <node TEXT="确认后切换成功" ID="0c9d53b5c5e86c0f75449b2b9cab11c0" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="采集人员[下拉]" ID="d4d166b3a8368b99eff96545c884ca5f" STYLE="fork">
                <node TEXT="端侧获取云端采集任务的采集人员是在连接机器人时统一获取的" ID="378cb19fb76acccc31d3384a7e315616" STYLE="fork"/>
                <node TEXT="获取该任务下，子任务为“采集中”的采集人员" ID="503bd82c531fffc1c122c8a8a3ae4b07" STYLE="fork"/>
                <node TEXT="场景" ID="1448a7c9b4e5a57617f188657dc30372" STYLE="fork">
                  <node TEXT="云端采集任务A，采集人员1（待采集）、采集人员2（待采集）、采集人员3（采集完成）；采集任务B，采集人员1（采集完成）、采集人员3（待采集）、采集人员4（待采集）" ID="557ddd835a57ce80f9b515c637a92657" STYLE="fork">
                    <node TEXT="选中采集任务A" ID="c8512d39b08681185bb7b44c602391ae" STYLE="fork">
                      <node TEXT="采集人员下拉展示：采集人员1、采集人员2" ID="92c76014a2b27e6c826ced3800d4fdb5" STYLE="fork">
                        <node TEXT="默认选中一位采集人员" ID="825a995ad649bd6037d0fe8fa264d400" STYLE="fork"/>
                        <node TEXT="不展示采集完成的采集人员" ID="28ed5d883f46c66e56e4492215277785" STYLE="fork"/>
                        <node TEXT="点击可切换采集人员" ID="4e5a278f7b85dc3a652e8fc263a5472b" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="切换采集任务B" ID="6f582ac642d2cc6ba34e459c480b8ed3" STYLE="fork">
                      <node TEXT="采集人员下拉展示：采集人员3、采集人员4" ID="160b41f546b1d72fa3afbe6135bbe5e3" STYLE="fork">
                        <node TEXT="默认选中一位采集人员" ID="91a9d3a6f12cf3454644c4b24bb28888" STYLE="fork"/>
                        <node TEXT="不展示采集完成的采集人员" ID="02061999009d286ba029934e3095d84e" STYLE="fork"/>
                        <node TEXT="点击可切换采集人员" ID="48cf739caeb81ce11eb6ebdf4bcf45f6" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="云端将采集任务A，采集人员1子任务状态变更为“采集完成”" ID="6372e53847697820fd495bdf5fbd0781" STYLE="fork">
                      <node TEXT="不影响端侧此采集人员的采集" ID="92b08c40ea8d15ce1d7ba289f77b57e7" STYLE="fork"/>
                      <node TEXT="端侧采集任务A，采集人员下拉中还是可以选采集人员1" ID="aa2ba2666e6336af21b8b3aac59c5e7d" STYLE="fork"/>
                      <node TEXT="杀掉APP重新连接后，采集任务A，采集人员下拉中不展示采集人员1" ID="593361e44d51ea9c1a34e3e7d14b8e28" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="端侧切换采集人员时，需要有二次确认提示：确认将当前采集员切换为「X」？" ID="7119b2152140474853079dfe24906965" STYLE="fork">
                  <node TEXT="确认后切换成功" ID="6dab05014f386d3c2a6dd72e4dd1eba9" STYLE="fork"/>
                </node>
                <node TEXT="与VR按钮联动" ID="5142e6367c59340a0d2e6eeb0e17c54c" STYLE="fork">
                  <node TEXT="可直接按键切换采集人员，顺序切换" ID="5c32444e82b647b35e8f68a0464ed655" STYLE="fork">
                    <node TEXT="端侧无需二次确认" ID="07a49bc459d0bf85594fc32e61d3dfa7" STYLE="fork"/>
                  </node>
                  <node TEXT="VR按键切换后，页面显示随之变更，显示当前的采集人员" ID="865604c890f9fc57ef61fb328d8a22cb" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="采集说明" ID="8d02a730fe347ddaa3190c375fa4730f" STYLE="fork">
                <node TEXT="云端创建任务填写的任务说明" ID="72eed4ed23db64fc09bce19439b78725" STYLE="fork"/>
                <node TEXT="可展示图片、视频、文档" ID="20b5bb6d54a560a8f2855b382f311978" STYLE="fork"/>
              </node>
              <node TEXT="采集数据（最近7条）" ID="0fbf0cbfb15e14e4f2e59057360fd566" STYLE="fork">
                <node TEXT="显示该任务该采集人员最近七条的采集数据" ID="b9452e73b17b3038d7ce67c10d1fedd3" STYLE="fork"/>
                <node TEXT="显示：采集时间、大小、有效/无效" ID="e4468d6227e1992f801245617f93391a" STYLE="fork">
                  <node TEXT="刚采集的数据一定为“有效”" ID="5155ebdb6b952839caca752b467226cb" STYLE="fork"/>
                </node>
                <node TEXT="不可点击查看，只做展示" ID="27f897610cc2974a9fde23822db03153" STYLE="fork"/>
              </node>
              <node TEXT="相机" ID="737011780301d1416b2a997995523c98" STYLE="fork">
                <node TEXT="主视角" ID="dc5d2af843d461e9f0424c2246583c1d" STYLE="fork">
                  <node TEXT="显示采集中的实时画面" ID="e333008ebea9bb4b51b1d9714218ab4e" STYLE="fork"/>
                  <node TEXT="未采集时「无画面」" ID="a0c3b12b683dfa0e0dcfeafcfa457ca3" STYLE="fork"/>
                  <node TEXT="掉线时标红「无画面」" ID="fc670f9bd759dc112ae9120cf1b0a814" STYLE="fork"/>
                </node>
                <node TEXT="左腕" ID="d6524fccdb3f3974b7cdfe8ca884d882" STYLE="fork">
                  <node TEXT="显示采集中的实时画面" ID="e412a95b8b7cd3856f7d56328a878e65" STYLE="fork"/>
                  <node TEXT="未采集时「无画面」" ID="ad380c250f6e61543abb76097174749a" STYLE="fork"/>
                  <node TEXT="掉线时标红「无画面」" ID="e28cb2c38a8f87bed5b1a220c538bf11" STYLE="fork"/>
                </node>
                <node TEXT="右腕" ID="42808ade948988b8615829049579f878" STYLE="fork">
                  <node TEXT="显示采集中的实时画面" ID="b045c92296214a39305cd1e69ceb9e02" STYLE="fork"/>
                  <node TEXT="未采集时「无画面」" ID="8e03bcd28acbdcf7447227dffc848b3f" STYLE="fork"/>
                  <node TEXT="掉线时标红「无画面」" ID="78eea0b0404688a79b4747c9af0d662b" STYLE="fork"/>
                </node>
                <node TEXT="全景" ID="8cfa5c01d1f815833c46505a92dad86f" STYLE="fork">
                  <node TEXT="显示采集中的实时画面" ID="0aa351f21ac613778c836cc6a386602f" STYLE="fork"/>
                  <node TEXT="未采集时「无画面」" ID="ecc2d209c7f079fea0c0d0865c20bf10" STYLE="fork"/>
                  <node TEXT="掉线时标红「无画面」" ID="740cefd5d6053024b4aaf6060f607506" STYLE="fork"/>
                </node>
                <node TEXT="四路平均分布（2×2）" ID="d022f7588f10a800d6be34503ffbbc1e" STYLE="fork"/>
              </node>
              <node TEXT="右侧操作区域" ID="d9149f2f8d3dd6728e030dd7e8038c26" STYLE="fork">
                <node TEXT="任务进度" ID="e31475269063dfbce1c0ff5e71596070" STYLE="fork">
                  <node TEXT="任务名 + 已采集条数/目标条数 + 进度条 + 还差X条" ID="2e6c195771087ec8b0e32492c3724e5d" STYLE="fork"/>
                  <node TEXT="任务达标后可继续采集:本机任务条数达标后仍可继续采集,A可超过B不做限制" ID="cdb16a6b5bd93c631e1aa4ed02351ccd" STYLE="fork"/>
                </node>
                <node TEXT="本条计时" ID="b668f698cf7bc43237678dc2fc49dcb7" STYLE="fork">
                  <node TEXT="展示本条采集计时" ID="b617e6d5d36b5b9a042de067fa31aab6" STYLE="fork"/>
                  <node TEXT="开始采集时走，停止归零" ID="66df2968484e5ee4ed98a103e3916029" STYLE="fork"/>
                </node>
                <node TEXT="录制状态" ID="d5b71053b6f4ed354989d4fd52fcfb19" STYLE="fork">
                  <node TEXT="当前" ID="ee2fad0e93ff8b291963bf51f2957d06" STYLE="fork">
                    <node TEXT="空闲" ID="89dd82b0d7727fb0dc058dbe4f2596a1" STYLE="fork">
                      <node TEXT="未开始采集" ID="0dfc79cafd188c632001ec846c9b744e" STYLE="fork"/>
                    </node>
                    <node TEXT="录制中" ID="74416a6f0b27f0395e7beac72e416400" STYLE="fork">
                      <node TEXT="正在采集" ID="d6de8b94921423fd230b779e5cdbff12" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="上一条" ID="2543258b876df4b185fa72a15daacd1a" STYLE="fork">
                    <node TEXT="—" ID="ddfd91fe3ab2e82e1eb0b8e17d0036ef" STYLE="fork">
                      <node TEXT="无上一条" ID="3819047c0489419555ab55b8e0073bd4" STYLE="fork"/>
                    </node>
                    <node TEXT="已保存" ID="c3c42ba566810fd93d4cc630902350c3" STYLE="fork">
                      <node TEXT="上一条采集已保存" ID="32d4c87c8e57e91db2321d236d19daac" STYLE="fork"/>
                    </node>
                    <node TEXT="已丢弃" ID="87720e438b6001037c3074c28d45679e" STYLE="fork">
                      <node TEXT="上一条采集已作废" ID="eb854d876020bf1055e4afd337968bd4" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="FSM状态" ID="c130c7a6ee7314c42b31042c6bf26674" STYLE="fork">
                  <node TEXT="当前" ID="f0bea0c9a53e01a91cfd06079585040e" STYLE="fork">
                    <node TEXT="HOME点" ID="c13a789904197914858985a7e6eedbb8" STYLE="fork">
                      <node TEXT="回零 / 原点状态" ID="2d49355f920c0b26fa3c827988d9bdd5" STYLE="fork"/>
                    </node>
                    <node TEXT="HOLD" ID="d5b39f9c29cf82ada1816e2666dc757f" STYLE="fork">
                      <node TEXT="保持 / 暂停状态" ID="2fc2bb43454d86638decdce18b837e45" STYLE="fork"/>
                    </node>
                    <node TEXT="OCSR" ID="a75d68c9eb190655b62609524878402e" STYLE="fork"/>
                  </node>
                  <node TEXT="机器人端给，我们只获取" ID="1fa718180d7bd53ad198b5b9eedb5241" STYLE="fork"/>
                </node>
                <node TEXT="【开始采集】" ID="78a59ff4d251a78f34698f2878495030" STYLE="fork">
                  <node TEXT="校验" ID="de47eeee1dbf4c519a067c6f854b8d60" STYLE="fork">
                    <node TEXT="机器人/双臂/VR/相机/存储" ID="e0f58beb99525cb79db81ca8265abd46" STYLE="fork">
                      <node TEXT="VR/夹爪/双臂/相机必须都正常才能采集" ID="e2a4d42282b33eeaa00d19d67986c69d" STYLE="fork">
                        <node TEXT="实时的，不是点按钮才校验" ID="8fa5966b4beb2d0fa632c8ebbb8774a8" STYLE="fork"/>
                      </node>
                      <node TEXT="存储 &lt; 20GB 禁用此按钮" ID="1e79e5524e3feecc4261c8db606256ec" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="点击开始采集" ID="b4f2566563e93dbeb32d4082dc2b0b70" STYLE="fork">
                    <node TEXT="本条计时开始从0计时" ID="1003e9a81551451aac0e0fbef5f04576" STYLE="fork"/>
                    <node TEXT="录制状态变更为“录制中”" ID="8d2ed970861000f5bb179330f4dd4f32" STYLE="fork"/>
                    <node TEXT="按钮名称变更为“停止并保存”" ID="d176574b18c26ad129e2f48b05614951" STYLE="fork">
                      <node TEXT="点击后停止本次采集录制，保存数据，左侧采集数据可显示最新的一条" ID="aaf6e14c307009de3f82db8516689a60" STYLE="fork"/>
                      <node TEXT="数据落点:采集文件(四路相机视频+轨迹)写入机器人机载工控,平板只缓存任务目录,不存episode文件" ID="5c51c9b85551987dd417906f76f415e9" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="与VR按钮联动" ID="0e966663eb71addea2f9106ae1ac9e53" STYLE="fork">
                    <node TEXT="可直接按键“开始采集”" ID="4ab12a258162c4514aa1cf1e3e0367fe" STYLE="fork"/>
                    <node TEXT="可直接按键“停止并保存”" ID="4a713be08e5f765a206fa1da59204357" STYLE="fork"/>
                  </node>
                  <node TEXT="场景" ID="6047aae65e409f3ae7086be3287261c9" STYLE="fork">
                    <node TEXT="采集中服务挂了" ID="be8c745e21f676fa160279a57763b258" STYLE="fork">
                      <node TEXT="弹窗报错" ID="17080e516014dccf3bf87d7d35326ba2" STYLE="fork">
                        <node TEXT="确认后回到待机模式（查看数据tab）" ID="c72406cc8686e0ee54ab42b6a9b5b723" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="采集中机器人 / VR / 相机断开" ID="9cc34aae0d1430879528952f5b2c0414" STYLE="fork">
                      <node TEXT="机器人（工控）" ID="66f71cb25b14eb904f7330e74b38d35c" STYLE="fork">
                        <node TEXT="连接双臂、底盘、相机的主控" ID="b20b0fe953495901d49dbaebb260e43e" STYLE="fork">
                          <node TEXT="机器人连接断开" ID="0c9202e90838401b8306dbdee9aba7ed" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="VR 头显和手柄" ID="35ecc563c6f9a91162ebc2f9122d288f" STYLE="fork">
                        <node TEXT="采集员的遥操输入" ID="31457cbe9f78f758a167ba4243d23da1" STYLE="fork">
                          <node TEXT="头显或手柄断开" ID="c1bf839a79087c539379b2d7fc10aa8b" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="四路相机" ID="7aa1196cbec164c082d2b25539620683" STYLE="fork">
                        <node TEXT="主视角、左腕、右腕、全景，录制采集画面" ID="608893acba65bd234982428152b0ada1" STYLE="fork">
                          <node TEXT="某一路无画面" ID="7a9d1b5e55323d580c955695aab5a596" STYLE="fork">
                            <node TEXT="弹窗报错：如：四路相机——主视角、左腕、右腕、全景，录制采集画面。右腕相机无画面，本条采集已丢弃。" ID="e4c8551a68db0930fccf1a206db82c23" STYLE="fork">
                              <node TEXT="确认后回到待机模式（查看数据tab）" ID="d23b321784381504a821da64742df295" STYLE="fork"/>
                            </node>
                          </node>
                        </node>
                      </node>
                    </node>
                  </node>
                </node>
                <node TEXT="【作废】" ID="ab55b9c4527162d65660b1a4a3378e8f" STYLE="fork">
                  <node TEXT="非录制中" ID="79c3b5e636657740c2e7f53771ef28ad" STYLE="fork">
                    <node TEXT="按钮置灰，无法点击" ID="b08b6f65ccf31868f157931941b0976d" STYLE="fork"/>
                  </node>
                  <node TEXT="录制中" ID="fa614ae8531e12a2100b97c29a1a44b1" STYLE="fork">
                    <node TEXT="按钮高亮，可点击" ID="bbbbe6e06e1922b6663c030389d7db9b" STYLE="fork"/>
                    <node TEXT="点击后弹出二次确认弹框“确认作废本条？作废后不保存、不计数。”" ID="2bdde4b2f8c92b1ce37ff8857c3810da" STYLE="fork">
                      <node TEXT="确认后，本次采集录制作废" ID="d8fce151c69d212499f0ac81868a4957" STYLE="fork">
                        <node TEXT="已采集数量不变" ID="78ebb451775ac875714c52bc64f73f9a" STYLE="fork"/>
                        <node TEXT="计时归零" ID="000a2dcce39982008aca8ceef15380cb" STYLE="fork"/>
                        <node TEXT="当前显示空闲" ID="9714b710fe6833b0a8f9a595a2b79146" STYLE="fork"/>
                        <node TEXT="上一条显示已丢弃" ID="34dd20bc39e78057dfa499424addc712" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="查看数据（封伟）" ID="a650cd9058619f01d09215af6712cd15" STYLE="fork">
            <node TEXT="对应机器人的待机模式" ID="37ad4305e2707182b217bd0efb4d8650" STYLE="fork">
              <node TEXT="不起服务" ID="8d726d7d9aed8073ee1d86460784360b" STYLE="fork"/>
            </node>
            <node TEXT="常驻顶栏" ID="d195942b10a13eb4934dd598199238b8" STYLE="fork">
              <node TEXT="Tab高亮选中“查看数据”" ID="03259fe7ffe7c49ff668d19361a79b3f" STYLE="fork">
                <node TEXT="可切换“数据采集”和“手动模式”" ID="2e894466f5641efa50079897363d2eaf" STYLE="fork"/>
              </node>
              <node TEXT="显示" ID="7c9637cf99ec4482c64614a2c35386e3" STYLE="fork">
                <node TEXT="双臂" ID="8657f2efd94b6e2ca239769afe73350d" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="364b5d1028a58c01645ae17303408b25" STYLE="fork"/>
                  <node TEXT="因为待机模式不起服务，所以颜色显示：灰" ID="b29a6bbe928634c51b22ffd41620592b" STYLE="fork"/>
                </node>
                <node TEXT="底盘" ID="8a5303c21bc2eb9386813c92c090b35d" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="d6ad1f496fea1b1909a71bec019fb9ce" STYLE="fork"/>
                  <node TEXT="因为待机模式不起服务，所以颜色显示：灰" ID="9b4bee4b4860933d57e493fd8cd6d293" STYLE="fork"/>
                </node>
                <node TEXT="剩余 xxx GB" ID="4ef7985659300655527a2fc8cc4a4788" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="d8f7e05fb44b26464d8df72d9f74a3d4" STYLE="fork"/>
                  <node TEXT="≥ 50GB" ID="0bfd43ec7864d060d4f08230e70d1bb4" STYLE="fork">
                    <node TEXT="显示：剩余 X GB" ID="67e953ce38895ef59900abd6702273f0" STYLE="fork">
                      <node TEXT="颜色：绿" ID="5d7adea9d27d298ef0c29a7745d53cf8" STYLE="fork"/>
                      <node TEXT="采集正常" ID="f999ce925bfe89f565cd11ecb1204b0b" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="20 ~ 50GB" ID="102c772eb12bd0ffea79344b02b9f697" STYLE="fork">
                    <node TEXT="显示：剩余 X GB · 建议上传" ID="0c51844dd212056743ec6dbb193a4af4" STYLE="fork">
                      <node TEXT="颜色：黄" ID="ebcdc2581d32eafb56a7956f2d656640" STYLE="fork"/>
                      <node TEXT="采集允许（提醒）" ID="dedc8da14a1ed5a33df8bb587a33e57f" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="&lt; 20GB" ID="3840d8618b1e094709fcbd22c4205341" STYLE="fork">
                    <node TEXT="显示：存储不足 X GB" ID="b2aefb45698fe0245ba32ca1903c3468" STYLE="fork">
                      <node TEXT="颜色：红" ID="82be6a5ba11ec702fee6bb3e85c87c0a" STYLE="fork"/>
                      <node TEXT="数据采集tab下禁止开始新采集" ID="be0fbeb1d4efa3b101a1fcaa5726d3c6" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
              <node TEXT="【设置】" ID="7ad80631b492f0103524d69cabab09e4" STYLE="fork">
                <node TEXT="点击弹出“设置”弹框" ID="56f048ac0b672d75ef57554d111baae3" STYLE="fork">
                  <node TEXT="【关闭】" ID="211e875a1fa8a4922f0a89a2b4ffb8a2" STYLE="fork">
                    <node TEXT="关闭弹框" ID="ff5d29eb26712710fa397941969a1181" STYLE="fork"/>
                  </node>
                  <node TEXT="基本设置" ID="99f8963cb06e378982984abda80a0ced" STYLE="fork">
                    <node TEXT="机器人IP" ID="ac62c8c3052aa8af2f5b7616e70e2b21" STYLE="fork">
                      <node TEXT="回显机器人IP" ID="c495bcb3bf1b8cfd7d907c560c3073e0" STYLE="fork">
                        <node TEXT="不允许修改" ID="e641d64aceb34ed392510044c7f96169" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="文案：打开 App 会按这个地址自动连接。改完保存即重新连接。" ID="288ba75c9dcbd0d9812c79a8f906f54d" STYLE="fork"/>
                    <node TEXT="文案：开机自动打开 App、自动连接上次机器人、没网读本地任务。采集中不能改 IP。" ID="bdf2f9fd15090c9384700dd5b93ebde2" STYLE="fork"/>
                    <node TEXT="【保存并连接】" ID="7adbb817d1c785599e0452b978e89499" STYLE="fork">
                      <node TEXT="置灰不允许点击" ID="f40d1724073a007bcee34613a4883b86" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="进程管理" ID="f37a02c19d8d6ed9f11482fdd5a3a19a" STYLE="fork">
                    <node TEXT="采集服务" ID="b8d49fe0283e423e714c56fd59d258ac" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="220dabb1d0e9053fd507d47eed1fa8a3" STYLE="fork"/>
                    </node>
                    <node TEXT="设备连接服务" ID="64ee594b561c3ceb97fecc1baced5e26" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="e0b623910a2767036be8ccc636d1ac45" STYLE="fork"/>
                    </node>
                    <node TEXT="网络同步服务" ID="42c7521b601ebfdc6ff8aed565d10bfb" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="9ea564a02223832989ef2b1231b4bbe7" STYLE="fork"/>
                    </node>
                    <node TEXT="数据存储服务" ID="9101992c77927f587b0e5583d8c2e5d6" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="9feb0a3882d4579cd6bbf5d59f552d71" STYLE="fork"/>
                    </node>
                    <node TEXT="日志服务" ID="3249baf323f7c43edb1dd92705778a9e" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="9a7f9f4f45c009bae8b37aa27aaf5f1e" STYLE="fork"/>
                    </node>
                    <node TEXT="【启用】" ID="a59c89cd329652dfbb6de69954e5d3ff" STYLE="fork">
                      <node TEXT="点击启用选中的服务" ID="bc8a7087eefe483f8e2ed13ccdb79528" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="975e734af0f282ca38044cc9cde28655" STYLE="fork"/>
                    </node>
                    <node TEXT="【停止】" ID="a785d589d62f29023488be95134ebf1b" STYLE="fork">
                      <node TEXT="点击停止选中的服务" ID="9b3a51aa90dc1248f35fb7d3acea0099" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="54a513ddeed3d15025a102514fddec45" STYLE="fork"/>
                    </node>
                    <node TEXT="【重启】" ID="6398d1bb63721c0295f5701f7aa4216d" STYLE="fork">
                      <node TEXT="点击重启选中的服务" ID="8db3ec3567b5b045ac47276b06be9a51" STYLE="fork"/>
                      <node TEXT="采集中功能禁用" ID="0e70b27b7ab8f0ff50bd43d8788d2005" STYLE="fork"/>
                    </node>
                    <node TEXT="测试服务异常时，状态显示正确" ID="703f2fcba6544c6b121adae8261d6661" STYLE="fork"/>
                  </node>
                  <node TEXT="日志查看" ID="bf08e2b8f7a5df061c856aa64c98925e" STYLE="fork">
                    <node TEXT="筛选" ID="c73c5efb5dc2489cbc5c76dabbae36da" STYLE="fork">
                      <node TEXT="全部时间" ID="fefa01befd5e808763e91ec61ea44b1a" STYLE="fork">
                        <node TEXT="默认选中" ID="3847425d68040afc9a7f24316aed93cb" STYLE="fork"/>
                      </node>
                      <node TEXT="最近1小时" ID="c76992304fff4ee2806caed05130525f" STYLE="fork"/>
                      <node TEXT="最近24小时" ID="a614537848910e1c647e8bb7f6656efa" STYLE="fork"/>
                      <node TEXT="最近7天" ID="41499110fc61b64e12fbbd7046d5c7b2" STYLE="fork"/>
                    </node>
                    <node TEXT="操作日志" ID="1aa8901ff4116208e7ed65c97da82d4d" STYLE="fork">
                      <node TEXT="显示端侧系统内，点击操作的日志" ID="9b765be956c13cc7b7063a87460cb755" STYLE="fork">
                        <node TEXT="如：" ID="cf2da5e7479c94bd2c11f42ae41bfb62" STYLE="fork">
                          <node TEXT="[操作] 停止并保存 compact_shoes" ID="38baef78ed771bac8033727023a314b7" STYLE="fork"/>
                          <node TEXT="[操作] 开始采集 compact_shoes" ID="4f0dd0013b2f7d8dafd84d72636d626e" STYLE="fork"/>
                          <node TEXT="[操作] 进入采集页" ID="662a0146888ad36952a30fc5adf8652b" STYLE="fork"/>
                          <node TEXT="[操作] 底盘移动 · 前进" ID="18620825ac1f287ac2d5e32b96c256fd" STYLE="fork"/>
                          <node TEXT="[操作] 手动控制 · 一键连接" ID="af5287e24cda481dd402c580600bf08d" STYLE="fork"/>
                          <node TEXT="[操作] 切换任务 · compact_shoes" ID="671caa4882783a7b06d107ef3dec7ae7" STYLE="fork"/>
                          <node TEXT="[操作] 切换人员 · 李四" ID="37b14c4b40fd008024e67b5c34d20b38" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="操作数据量大时的展示正常" ID="ab235bbebf62ff5499386cecd6f4fcf9" STYLE="fork"/>
                    </node>
                    <node TEXT="【下载】" ID="531fbfa28006cd0f58363f50ebfdd26a" STYLE="fork">
                      <node TEXT="点击下载对应筛选项的操作日志" ID="32adbeb30e4adb2783a02dff9380e482" STYLE="fork"/>
                      <node TEXT="文件名称：log_时间戳" ID="1506a8b7ba80185b0c96dae32b7437fa" STYLE="fork"/>
                      <node TEXT="文件类型：.log" ID="a2434d66b2a5f0113e4cd3733eaeb128" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="设备状态" ID="486daea104788ffc4a09bc3338f3ae05" STYLE="fork">
                    <node TEXT="文案：各设备与服务的当前状态。待机时服务已停止，进入采集或手动控制时自动启动。" ID="70b669ab0e40f3a5ca75a6113d4d0c79" STYLE="fork"/>
                    <node TEXT="机器人（工控）" ID="fc9a580c623a24e32aa10d54b1bd3a79" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="0a4ae38c0c327e81f2cb85cc55c290f4" STYLE="fork"/>
                    </node>
                    <node TEXT="双臂" ID="7f045a8e2ef0e8f43f6b08685fbe2490" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="ef51b9bd0e9eb05c64def0c6ead03a7d" STYLE="fork"/>
                    </node>
                    <node TEXT="夹爪" ID="f10ddf1b729150c35d0e70f9d1e2c73a" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="3aa33ee5a4f9cc668d287705d6db3eac" STYLE="fork"/>
                    </node>
                    <node TEXT="底盘" ID="9d42ee440ac856fa4b5c8f642264df05" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="56b0f1ed572ddaf9f6aff56a17cee58d" STYLE="fork"/>
                    </node>
                    <node TEXT="主视角相机" ID="8dd296c9172b1f7d9a2b10cbf4ebc7b7" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="59301dd1fb4db510bde996f04db7e248" STYLE="fork"/>
                    </node>
                    <node TEXT="左腕相机" ID="c479aad0d319f3f3c6098377653ccfc3" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="47951d0178335f5382f7c0e658c09ef3" STYLE="fork"/>
                    </node>
                    <node TEXT="右腕相机" ID="f25e137e173f6493420aefb0611535d6" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="754f52f9fa022de4132a3bd082187618" STYLE="fork"/>
                    </node>
                    <node TEXT="全景相机" ID="78d3e6f9bafaf27445bc0d8e9ed6cc1a" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="be845513fefd383bac55d391f3d4ff23" STYLE="fork"/>
                    </node>
                    <node TEXT="机载存储" ID="b37f574815a67ed49e3d187d9bc5f8e3" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="b1aad2b8d7f100047aa7b22236189d8f" STYLE="fork"/>
                    </node>
                    <node TEXT="测试断电后，状态显示正确" ID="6ff82eefd42abfeeb0d07d514790c738" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="查看数据" ID="962cf2038aa4e470cb429e32f152e7b9" STYLE="fork">
              <node TEXT="筛选区域" ID="2c1fbc58fc846e278f6a5d8a4613a57e" STYLE="fork">
                <node TEXT="采集任务[下拉]" ID="e5789a153b9f434e3685ba59202b8814" STYLE="fork">
                  <node TEXT="端侧获取云端采集任务是在连接机器人时统一获取的" ID="0114a531348fbec5d36171adcd671779" STYLE="fork"/>
                  <node TEXT="获取云端采集中，下发给当前机器人的任务" ID="031b381e084826cfec3ada6e30167d03" STYLE="fork"/>
                  <node TEXT="场景" ID="7fb2fec31fb9eb6e6378e5e397cb6fbd" STYLE="fork">
                    <node TEXT="当前任务状态在云端为“采集中”，端侧正在查看数据时，云端将状态变更为 “采集完成”" ID="99b96f9806d82b835eafcd01bb56a5e0" STYLE="fork">
                      <node TEXT="不影响端侧的查看数据" ID="f4783ded2584c1f93804536e592a9dc1" STYLE="fork"/>
                      <node TEXT="采集人员可以正常切换" ID="a70e9a43dc22bf5e514005844de15c82" STYLE="fork"/>
                      <node TEXT="切换模式后，任务还是存在" ID="3002e5a6425dda4820515def6e421020" STYLE="fork"/>
                      <node TEXT="杀掉APP重新连接后，任务不展示" ID="c5145bac9d872b7b47448900c2102f01" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="采集人员[下拉]" ID="7cb2a00b90a45942d3f4d3dad7388d3f" STYLE="fork">
                  <node TEXT="端侧获取云端采集任务的采集人员是在连接机器人时统一获取的" ID="f107596eb7fe06bf339b404ed22065bf" STYLE="fork"/>
                  <node TEXT="获取该任务下，子任务为“采集中”的采集人员" ID="5a39087f07040e4f513f65c6c3a7303f" STYLE="fork"/>
                </node>
                <node TEXT="全部tab" ID="e4ab497a0b46308627eba17dde4b370c" STYLE="fork">
                  <node TEXT="显示筛选条件下所有的采集数据" ID="d0b46db83d84dd4064557feda1d538e4" STYLE="fork"/>
                </node>
                <node TEXT="有效tab" ID="a589fee4b5cd6aeaa328f9a57e691ec7" STYLE="fork">
                  <node TEXT="显示筛选条件下标记为“有效”的采集数据" ID="1a4e9eea1407359e72a4716aebdb90ef" STYLE="fork"/>
                </node>
                <node TEXT="无效tab" ID="0f524f07fd83fe4a44925b5e14e895e4" STYLE="fork">
                  <node TEXT="显示筛选条件下标记为“无效”的采集数据" ID="a3fa53304e5065edf3fd7be776665038" STYLE="fork"/>
                </node>
                <node TEXT="共X条" ID="e4c62de29688bad7ae15d780a7761b53" STYLE="fork">
                  <node TEXT="显示筛选条件下一共有多少条采集的数据" ID="afaaab71ed4b1154201d34ae2ddf408d" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="左侧列表" ID="0baf658639abc030f0487a4f789d4ece" STYLE="fork">
                <node TEXT="显示筛选条件下的每一条采集数据" ID="292db71db44f519664afa0019052d9e8" STYLE="fork">
                  <node TEXT="显示：名称 + 大小 + 有效/无效" ID="bb498b6c892e19db2d6933dcd9dfaeef" STYLE="fork">
                    <node TEXT="刚采集的数据为“有效”，可手动标记为“无效”" ID="71f136866a19c113fd52210b5a2d0e6b" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="点击数据后右侧显示“本条信息”，点击播放自动切回放，播放中可点「详情」临时看信息（播放不暂停）" ID="f6018467e766dbc5a471a2ba851a244e" STYLE="fork"/>
                <node TEXT="切换筛选回第1页:任务/人员/有效/无效筛选条件切换后,列表回到第1页" ID="148b275e7bfaa75d0108263ddfbacecb" STYLE="fork"/>
                <node TEXT="分页：每页 20 条" ID="ac4a2e98b311c04e273028a6f879d2e5" STYLE="fork"/>
              </node>
              <node TEXT="回放区域" ID="2a887d166f8841e45f54809295be431e" STYLE="fork">
                <node TEXT="空状态:未选中任何数据时,右侧不显示相机画面,居中占位&quot;请先选择左侧一条数据查看&quot;" ID="626d38b02e2f88880d47586a0a06c219" STYLE="fork"/>
                <node TEXT="显示：回放 · 时间   有效/无效" ID="3375e31df1729cfe4a5c3ca5defd07c3" STYLE="fork"/>
                <node TEXT="【上一条】" ID="1e66e0b9fb99ca0d0846685a11fc37c5" STYLE="fork">
                  <node TEXT="点击跳转上一条采集数据信息" ID="1d48b593a9d7dfa260f2b23aa243b820" STYLE="fork"/>
                </node>
                <node TEXT="【下一条】" ID="27e1984cd48ed481710f8ee07f3f6659" STYLE="fork">
                  <node TEXT="点击跳转下一条采集数据信息" ID="bdba2487b844800d3c018a324ff5f47d" STYLE="fork"/>
                </node>
                <node TEXT="【详情】/【关闭详情】" ID="a8cc400f2c27590d9fbed931e6741272" STYLE="fork">
                  <node TEXT="显示“本条信息”" ID="14f34a9ac5949659acd8c11635aa71b3" STYLE="fork">
                    <node TEXT="任务名称" ID="ddf1aa82a7d04a6d595f9898ad3de82d" STYLE="fork">
                      <node TEXT="显示该采集数据任务的名称" ID="1f085eb4e18669764678c19cfa293a9a" STYLE="fork"/>
                    </node>
                    <node TEXT="文件名称" ID="0f5ec157cecc08cc75e68e4edd18bbca" STYLE="fork">
                      <node TEXT="显示该采集数据文件的名称" ID="abf156ebda57efbb0037b56eea844e32" STYLE="fork"/>
                    </node>
                    <node TEXT="采集时间" ID="d38a5e560622a610cb4f82976cfdef94" STYLE="fork">
                      <node TEXT="显示该采集数据开始采集的时间" ID="7457271d459bdbfdeb2e6c987b28e1a8" STYLE="fork"/>
                    </node>
                    <node TEXT="采集人员" ID="825a52ac68ee00cd1113ae683d2e1f68" STYLE="fork">
                      <node TEXT="显示该采集数据的采集人员" ID="c6d2586d73c1c3fbc627ffe78c8c4647" STYLE="fork"/>
                    </node>
                    <node TEXT="机器人" ID="a5ab73a8c689a4fb3fd7447d4295a7ac" STYLE="fork">
                      <node TEXT="显示该采集数据的机器人编号+名称" ID="3b88b84a3e9bdc78f678b91ad42a392f" STYLE="fork"/>
                    </node>
                    <node TEXT="存储地址" ID="1b5a1aa3fd23b5d87789d2f5f2b41cad" STYLE="fork">
                      <node TEXT="显示该采集数据的存储地址" ID="c4f26dad28b95faed8167b1ff278bfc1" STYLE="fork"/>
                    </node>
                    <node TEXT="文件大小" ID="ae36eda36af056ec919a0476add03217" STYLE="fork">
                      <node TEXT="显示该采集数据大小" ID="01f414cfdb8ac0a413c3ec5781d8ee1a" STYLE="fork"/>
                    </node>
                    <node TEXT="视频时长" ID="ec575fb47d9366014ce961f2fd55aa21" STYLE="fork">
                      <node TEXT="显示该采集数据时长" ID="c7910e5fd7b4547194b87c762feef03f" STYLE="fork"/>
                    </node>
                    <node TEXT="【采集说明】" ID="4999a81ab6ad74fd60166cd52cb7ff45" STYLE="fork">
                      <node TEXT="点击显示该任务的采集说明" ID="95241c0e4e3d1cc8da7d968d834ff3eb" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="【最大化】" ID="3d83000ea9289fe24d373f8e315e3a0f" STYLE="fork">
                  <node TEXT="点击后回放区铺满整屏（任务列表与顶栏隐藏），四路相机放大到上半屏，关节数据纵排在下方，整块可上下滚动。" ID="77fca8bd7a7eff8f63981481062e4afe" STYLE="fork"/>
                </node>
                <node TEXT="【标记有效】/【标记无效】" ID="141bf7e30cdc1634c5bd8cfc271647cb" STYLE="fork">
                  <node TEXT="将该条采集数据标记为有效/无效" ID="0b97b51ecc62c547ec584ea83fc25d0a" STYLE="fork">
                    <node TEXT="标记后，杀掉APP重新进入，找到该数据标记存在且正确" ID="c0a8922eed5585921e3f6512940e0a94" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="主视角、左腕、右腕、全景四路相机画面 2×2" ID="6571537456861874401d90156762bf18" STYLE="fork">
                  <node TEXT="双击相机全屏:双击任一相机(主视角/左腕/右腕/全景)单独全屏,右上角出现&quot;退出全屏&quot;按钮,底部浮出播放条;点按钮或ESC恢复" ID="fc07eef798f17e46048c655e79fdd69e" STYLE="fork"/>
                </node>
                <node TEXT="左臂 · xx" ID="6d3105cadea670ad744638873264928b" STYLE="fork">
                  <node TEXT="指令tab" ID="a6df953e8f8cfb4ccf7b123539fc915c" STYLE="fork">
                    <node TEXT="默认选中" ID="f898a7e04c60e691e3a47cb146dbcfb4" STYLE="fork"/>
                  </node>
                  <node TEXT="状态tab" ID="9f8be87683e0dd635b392f78b12ec145" STYLE="fork"/>
                  <node TEXT="全部tab" ID="130561b40806a75a8f3a5496b478e89b" STYLE="fork"/>
                  <node TEXT="回显测试展示正常即可" ID="3c72255d37a4dbeff4f2e2df973a1544" STYLE="fork"/>
                </node>
                <node TEXT="右臂 · xx" ID="91a77454c698707da2923edc5811931c" STYLE="fork">
                  <node TEXT="指令tab" ID="aaaed82d152fe932da916f61ef1dfebf" STYLE="fork">
                    <node TEXT="默认选中" ID="94518126c4addb4d75471fca94c39be1" STYLE="fork"/>
                  </node>
                  <node TEXT="状态tab" ID="3da583c9ba99cda93c345460ab85becd" STYLE="fork"/>
                  <node TEXT="全部tab" ID="ce7dcf9fdec68816206a5f6cf129d7d4" STYLE="fork"/>
                  <node TEXT="回显测试展示正常即可" ID="100a35b9c977b78eb55b041de8611470" STYLE="fork"/>
                </node>
                <node TEXT="身体 · xx" ID="31eb0a4f9e8b507c6bba98b9b125dfa6" STYLE="fork">
                  <node TEXT="指令tab" ID="f05368b97ce3ebcfbf694ac2f17362f8" STYLE="fork">
                    <node TEXT="默认选中" ID="7457b9decad79970b9983e1d93c9d809" STYLE="fork"/>
                  </node>
                  <node TEXT="状态tab" ID="4e0e304a056769371468fccdf1c42820" STYLE="fork"/>
                  <node TEXT="全部tab" ID="cc1eb330ad427325e8e2b6fe3e7d28be" STYLE="fork"/>
                  <node TEXT="回显测试展示正常即可" ID="69a2bacf20ad89659ec8bc3c9318a093" STYLE="fork"/>
                </node>
                <node TEXT="底部视频播放功能性按钮" ID="68bd98550ab3b1b42fc11910b5000c64" STYLE="fork">
                  <node TEXT="|&lt;&lt;" ID="4a1eda2ef0887dbef17728c1567dd335" STYLE="fork">
                    <node TEXT="后退5秒" ID="c85775611b335d9a6d863c569fbf9139" STYLE="fork"/>
                  </node>
                  <node TEXT="&lt;" ID="075c7d8cadf50399a27874f7dbfe1886" STYLE="fork">
                    <node TEXT="逐帧后退" ID="e08572b2a74e0f4d0cc62715632926ae" STYLE="fork">
                      <node TEXT="点一次一帧" ID="54eced7cd5ab2b214f25932c57220f74" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="播放/暂停" ID="0c8127e57383d8ee4d7a94c3b24c645d" STYLE="fork">
                    <node TEXT="点击播放/点击暂停" ID="218b58634953bf7b5e11c158f771a99b" STYLE="fork"/>
                  </node>
                  <node TEXT="&gt;" ID="578df533001da484c670ab8cc3f297fa" STYLE="fork">
                    <node TEXT="逐帧前进" ID="9fca7269163638ea7018cf720f3db3dc" STYLE="fork">
                      <node TEXT="点一次一帧" ID="faf5c095ab65d7e8c9f3e365959158c8" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="&gt;&gt;|" ID="5945c28629cdee590cd2b62888925359" STYLE="fork">
                    <node TEXT="前进5秒" ID="f39fcd919689d8477d57477d61386dab" STYLE="fork"/>
                  </node>
                  <node TEXT="视频条" ID="35c28ccfe47a80fbc82d2353392a415c" STYLE="fork">
                    <node TEXT="点击可快速切换视频位置" ID="978d398018ef8611784a66fc035e3616" STYLE="fork"/>
                  </node>
                  <node TEXT="视频时间" ID="95e118290bd82bac649fa72a37524b83" STYLE="fork">
                    <node TEXT="AAA / BBB" ID="1b064ad93806be6b0ae3971ceb86755c" STYLE="fork">
                      <node TEXT="AAA：当前播放的时间" ID="c70d6a9c4311d3bf4a13c00daedbca64" STYLE="fork"/>
                      <node TEXT="BBB：整体视频的时间" ID="b1465be4fc2b63db699c3d94a4d952a8" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="倍速" ID="1f2a66f95e12841288b3601be88af48b" STYLE="fork">
                    <node TEXT="1×" ID="01229cab34977598fbbcfd84da3f4e97" STYLE="fork">
                      <node TEXT="正常倍速播放" ID="689f3b5ad4aff56c37123a0356c59cb9" STYLE="fork"/>
                    </node>
                    <node TEXT="2×" ID="726ba1af73f8515c9502f7eb4369aa98" STYLE="fork">
                      <node TEXT="2倍速播放" ID="f44d3617aa08bb744fd994ea472ec455" STYLE="fork"/>
                    </node>
                    <node TEXT="4×" ID="a8f94bfceb77b3c542f997ef183b8dd0" STYLE="fork">
                      <node TEXT="4倍速播放" ID="862e904d65409f5240cb940d14d22ea5" STYLE="fork"/>
                    </node>
                    <node TEXT="0.5×" ID="7bba67abaea03c5acc69f47b22c1443a" STYLE="fork">
                      <node TEXT="0.5倍速播放" ID="85020fbeeb5cd87bd8c2cdc5b482f634" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="循环播放icon" ID="65000e295e43ee01530a37b2adcbf37f" STYLE="fork">
                    <node TEXT="未选中" ID="4df73e86a13995d1ab0807cab433f7dc" STYLE="fork">
                      <node TEXT="视频播放结束后，暂停播放" ID="75e32017a0edd850c2868a1b12206c39" STYLE="fork"/>
                    </node>
                    <node TEXT="已选中" ID="c6079dc834034007ee4a9069577d6420" STYLE="fork">
                      <node TEXT="视频播放结束后，从头开始循环播放" ID="8c2da5f596ca266f768b893015fd27fb" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="手动模式（林禹成）" ID="95b7299ed899bcfb00c9a8b1a52a9903" STYLE="fork">
            <node TEXT="对应机器人的手动模式" ID="c160e0f0ef2840b435ec7e1a0e700941" STYLE="fork">
              <node TEXT="自动起 双臂、底盘" ID="0f4d232323bfee49ba2e8a560db27538" STYLE="fork"/>
              <node TEXT="离开延迟60s杀服务:离开采集/手动模式页面延迟60s杀服务,60s内回来复用,超时全停" ID="ebafd63e77559443004e0dfd62c00bc4" STYLE="fork"/>
            </node>
            <node TEXT="常驻顶栏" ID="c10b47f43c5428b1da5a2a4049cbab7c" STYLE="fork">
              <node TEXT="Tab高亮选中“手动模式”" ID="2c1d0aaa2da96e380805da3bad138d0a" STYLE="fork">
                <node TEXT="可切换“数据采集”和“查看数据”" ID="fe098ef5157a2a60cf00b37ef8ae087e" STYLE="fork"/>
              </node>
              <node TEXT="显示" ID="d668c02ed71c3f415a25741b08ef454f" STYLE="fork">
                <node TEXT="双臂" ID="26f1b3cb579932d6de1da0d383874d6d" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="06ceadb00667e504511b2cff30a2a635" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="b106dd287338c094ff87caed11c1cfbe" STYLE="fork"/>
                </node>
                <node TEXT="底盘" ID="bbd744108a2e669fef1a98deb085afca" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="69cdcbd3e90dfb20cd9f62a932e20c47" STYLE="fork"/>
                  <node TEXT="绿 = 就绪/在线，灰 = 未启动/未连接，红 = 急停/异常/掉线" ID="02d1e190fe32cbe8e60db4aa7fcd9c0c" STYLE="fork"/>
                </node>
                <node TEXT="剩余 xxx GB" ID="c4a61bba5bad1f01b80c42f61c09c503" STYLE="fork">
                  <node TEXT="点按弹出「设备名 · 状态」气泡" ID="43583e654064d9a413ceac21f6e15d0e" STYLE="fork"/>
                  <node TEXT="≥ 50GB" ID="28d24d61ea2d2f939ead069f625337ad" STYLE="fork">
                    <node TEXT="显示：剩余 X GB" ID="5f6771a81cce4d896e81a1f2e366f80c" STYLE="fork">
                      <node TEXT="颜色：绿" ID="32d07140bf7010e256681f291337dd9a" STYLE="fork"/>
                      <node TEXT="采集正常" ID="b21a1e4fc05c473daed48c41358f84f4" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="20 ~ 50GB" ID="8346f514e5d507aee2621f57d4a27cbf" STYLE="fork">
                    <node TEXT="显示：剩余 X GB · 建议上传" ID="8fa4b1afb9597d49332ad041802b6e94" STYLE="fork">
                      <node TEXT="颜色：黄" ID="41871ce285297d2bb1f327c5a2f9e34c" STYLE="fork"/>
                      <node TEXT="采集允许（提醒）" ID="61c606ac2a0f26bcccce6308105d1963" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="&lt; 20GB" ID="2f913bbc875caf67bc1e9dd5dfdd2487" STYLE="fork">
                    <node TEXT="显示：存储不足 X GB" ID="ff0c2dc8c6ffd6de89ff2455e376d953" STYLE="fork">
                      <node TEXT="颜色：红" ID="94eeffa40981ed2221ebb5b63210ad98" STYLE="fork"/>
                      <node TEXT="数据采集tab下禁止开始新采集" ID="e200cf3423002dc90fa35bf9b1b3ad2d" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
              <node TEXT="【设置】" ID="0183b1dfb69888392cb727488e04ded6" STYLE="fork">
                <node TEXT="点击弹出“设置”弹框" ID="94bb6aaf7357d033af7fa1c9a3fd8412" STYLE="fork">
                  <node TEXT="【关闭】" ID="90dc4c319270360b5db4f52ae95900f1" STYLE="fork">
                    <node TEXT="关闭弹框" ID="4a0c03cf4a896ec752c5cf434f0ea1c9" STYLE="fork"/>
                  </node>
                  <node TEXT="基本设置" ID="32b81bcd85d7d21325f0a19c51cde9ba" STYLE="fork">
                    <node TEXT="机器人IP" ID="4922e99036e827cca789d89d452aa025" STYLE="fork">
                      <node TEXT="回显机器人IP" ID="cba664c12ed862aece9f514247ab7190" STYLE="fork">
                        <node TEXT="可以修改" ID="30ffd58481928fe5328db04b088007cb" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="文案：打开 App 会按这个地址自动连接。改完保存即重新连接。" ID="19ff7b082739aa0616c76a3340a8e1ad" STYLE="fork"/>
                    <node TEXT="文案：开机自动打开 App、自动连接上次机器人、没网读本地任务。采集中不能改 IP。" ID="7aa8e48cd0641e5d07c0b4e3eb430d73" STYLE="fork"/>
                    <node TEXT="【保存并连接】" ID="8477cfcc0c3d123c1fb1e5abf96b0186" STYLE="fork">
                      <node TEXT="可以点击，点击后以新的机器人IP进行连接" ID="44b5e7a15754f54e70d17bff7b57ba3c" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="进程管理" ID="1cbd718c324f4364751cf32e8c515a8b" STYLE="fork">
                    <node TEXT="采集服务" ID="1d30e243c0002728a8f7e20bf48144e9" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="8d7218c613dab48a16ab264f69e139d6" STYLE="fork"/>
                    </node>
                    <node TEXT="设备连接服务" ID="52b292b16fcddff42e2ac3285fab645f" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="c17ec851ce936b2ac64e7e55b57d8e05" STYLE="fork"/>
                    </node>
                    <node TEXT="网络同步服务" ID="e4ea492e0f05d711230932fd6f5d2136" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="d725a275b4760de4dd07d4933995cb5e" STYLE="fork"/>
                    </node>
                    <node TEXT="数据存储服务" ID="6ab0c5e88360c8a3491469a7a02bb76f" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="5df628e7744984d8929b83c12372846a" STYLE="fork"/>
                    </node>
                    <node TEXT="日志服务" ID="5af6883c879467090dac657d446ff2eb" STYLE="fork">
                      <node TEXT="显示颜色和运行状态" ID="89ee92072faeacfbad35ce69d5f5630b" STYLE="fork"/>
                    </node>
                    <node TEXT="【启用】" ID="1992201c792066065fc11ad3e491adfd" STYLE="fork">
                      <node TEXT="点击启用选中的服务" ID="40484cc350587d6606c6c8450a0cbef7" STYLE="fork"/>
                    </node>
                    <node TEXT="【停止】" ID="e09a046787b9b80212a9104ecced3edf" STYLE="fork">
                      <node TEXT="点击停止选中的服务" ID="619336ff8ba84956bca571f53658f34e" STYLE="fork"/>
                    </node>
                    <node TEXT="【重启】" ID="ae4be03b3299fc2067616454a865b82e" STYLE="fork">
                      <node TEXT="点击重启选中的服务" ID="9eb25bee4727e279aefcfab2aa442813" STYLE="fork"/>
                    </node>
                    <node TEXT="测试服务异常时，状态显示正确" ID="4a90d8fad4e28b08fe9b69d5444e75d8" STYLE="fork"/>
                  </node>
                  <node TEXT="日志查看" ID="756afc5fc4c880a2dfcd641b2f2255b2" STYLE="fork">
                    <node TEXT="筛选" ID="f539cd33673b9b0f00d75bce808885e7" STYLE="fork">
                      <node TEXT="全部时间" ID="ab8d2cce0e42aac50fed4a9fbf06fd35" STYLE="fork">
                        <node TEXT="默认选中" ID="8574bb7812e623f2393c6893de89cf2a" STYLE="fork"/>
                      </node>
                      <node TEXT="最近1小时" ID="53c6641260f083054690ad94bd85e261" STYLE="fork"/>
                      <node TEXT="最近24小时" ID="c304c163f056607bbb85d3f822aca82e" STYLE="fork"/>
                      <node TEXT="最近7天" ID="ee20a373534f5505cf2f3490ecf36a0d" STYLE="fork"/>
                    </node>
                    <node TEXT="操作日志" ID="7138f76973273c2078e4b546e1ffc020" STYLE="fork">
                      <node TEXT="显示端侧系统内，点击操作的日志" ID="ebc9e2333b6de0fefcd10378ffe6f6f9" STYLE="fork">
                        <node TEXT="如：" ID="e51c6f1ed13f66aa57730c52e1883cde" STYLE="fork">
                          <node TEXT="[操作] 停止并保存 compact_shoes" ID="1abec3bb17ff1150f6d9215eda113439" STYLE="fork"/>
                          <node TEXT="[操作] 开始采集 compact_shoes" ID="0ffa453abe56ffb23d88670fac66613f" STYLE="fork"/>
                          <node TEXT="[操作] 进入采集页" ID="085f54fc2c778ee6f562e1ff379a1212" STYLE="fork"/>
                          <node TEXT="[操作] 底盘移动 · 前进" ID="7d100a12153451b43d5a3d7d8a360881" STYLE="fork"/>
                          <node TEXT="[操作] 手动控制 · 一键连接" ID="afa89208f6fa274590a79c8560871dfe" STYLE="fork"/>
                          <node TEXT="[操作] 切换任务 · compact_shoes" ID="fb95dface573bebe2807c1a3e38eca35" STYLE="fork"/>
                          <node TEXT="[操作] 切换人员 · 李四" ID="cf3f3b227e79a3fa937b04fdb90d14b2" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="操作数据量大时的展示正常" ID="391a584eb43fd3cfd6da75c71c767d6a" STYLE="fork"/>
                    </node>
                    <node TEXT="【下载】" ID="fb905fab3b7b2d5b3f9b59667d484856" STYLE="fork">
                      <node TEXT="点击下载对应筛选项的操作日志" ID="7cc400f2d20c224df223aa89ae193be4" STYLE="fork"/>
                      <node TEXT="文件名称：log_时间戳" ID="1c4f52ead74c488671e027dac723a470" STYLE="fork"/>
                      <node TEXT="文件类型：.log" ID="5780f98f2e1b77bcbd5100af2ed75bac" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="设备状态" ID="978e90bc2749583380503e4fcb34a448" STYLE="fork">
                    <node TEXT="文案：各设备与服务的当前状态。待机时服务已停止，进入采集或手动控制时自动启动。" ID="2c3ed087a46116686d5ec33a143e05b5" STYLE="fork"/>
                    <node TEXT="机器人（工控）" ID="eb4326d72d183ac00723034d8ac2171d" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="42b047749ed0c2f761245fd8a81794df" STYLE="fork"/>
                    </node>
                    <node TEXT="双臂" ID="15a09b7ed3b172f86b430e28e7871bf4" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="8e9c60afa47dc82f197a9183be2ad961" STYLE="fork"/>
                    </node>
                    <node TEXT="夹爪" ID="5eee949d4a219d2f8c330d5699c78238" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="869050f2ce8c1529515f91ed235fd735" STYLE="fork"/>
                    </node>
                    <node TEXT="底盘" ID="7e43ec45aaae5eeefe48306145e90ac5" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="0ce23201f4ba52dec5353bc03b9750e2" STYLE="fork"/>
                    </node>
                    <node TEXT="主视角相机" ID="f3151a0faabed144621e0b75be7d8daf" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="8529a5366c7b18f8f7d6eab267f1d9fb" STYLE="fork"/>
                    </node>
                    <node TEXT="左腕相机" ID="8ff0419e25f0267ef8a69d72c4fbdfb2" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="adfee3f758de9489247300bdcc6e2a3d" STYLE="fork"/>
                    </node>
                    <node TEXT="右腕相机" ID="601f1f9a97059e0b0ee3e3a01920433e" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="2643dcb1e4f43fc13de25810a02e2cd6" STYLE="fork"/>
                    </node>
                    <node TEXT="全景相机" ID="060b5935fa4e47a230371ab59d52685c" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="6b818db4b30cd28a6df8fdfc3bc1d814" STYLE="fork"/>
                    </node>
                    <node TEXT="机载存储" ID="13ffaaace8848e7e4e09590b03db9314" STYLE="fork">
                      <node TEXT="显示状态颜色、是否上电" ID="339d22b6b719cde904aa975d0e595c07" STYLE="fork"/>
                    </node>
                    <node TEXT="测试断电后，状态显示正确" ID="1be8e5891a2ab6420345fd7425c88634" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="文案：连接底盘和双臂后才能控制" ID="db92cc6fb1a1372c5cfa0c8fa02a829b" STYLE="fork"/>
            <node TEXT="【一键连接】" ID="8286e18bf4bcd09e163137717bf25ff8" STYLE="fork">
              <node TEXT="点击连接底盘和双臂" ID="21f0c8f8060159e7597a854b5d2fb4f8" STYLE="fork">
                <node TEXT="提示：“底盘和双臂已连接”后可进行操作" ID="bbd9d9bf09c1736fdc97b82765802c20" STYLE="fork"/>
              </node>
              <node TEXT="一键连接补连:单个服务失败或中途断开时,可一键连接补连;部分失败提示可重试" ID="dcfa27414162f01bad9fef51feb372a2" STYLE="fork"/>
            </node>
            <node TEXT="操作区域" ID="49866ab5a80a25f0a68ad337c6e29d56" STYLE="fork">
              <node TEXT="单服务失败互不干扰:双臂/底盘只连上一个时,连上的可操作,另一个置灰(回home/方向键)" ID="f5fcc32eeba45e74db0ce10a5e6b8d73" STYLE="fork"/>
              <node TEXT="双臂服务" ID="08b693d717a5b01baf97ca2690cd1900" STYLE="fork">
                <node TEXT="【回home点】" ID="59b691f1b3422bed3bfb07fee48696b9" STYLE="fork">
                  <node TEXT="点击弹出“回位确认”弹框" ID="442c37aa22faa94f42c8d9d4871d3049" STYLE="fork">
                    <node TEXT="文案：" ID="5769ad9a10ad72da31ebd9ecbef8bd5c" STYLE="fork">
                      <node TEXT="下一个回位点：home 点" ID="a7bd8ccfe4b2d929f63715faa992e8c1" STYLE="fork"/>
                      <node TEXT="位姿：零点位姿" ID="e6538df64cb5b06dedbfdaf89675ef5e" STYLE="fork"/>
                      <node TEXT="即将移动机械臂，请确认周边无障碍物、人员已远离，以免碰撞。" ID="d9f003782ce387ae8aac25fdc4d4ecbd" STYLE="fork"/>
                    </node>
                    <node TEXT="【确认移动】" ID="d29b281439ad54719c71a7a0c27336a9" STYLE="fork">
                      <node TEXT="显示：移动中" ID="0302ab4cea31d744bfa1747434319b10" STYLE="fork"/>
                      <node TEXT="显示：双臂 · 回位到「打包位姿」" ID="9d94afdd1ab3da2a6abcafb4c676ca32" STYLE="fork"/>
                      <node TEXT="loading后提示：双臂已回「home 点」" ID="64442de565576d5c13b669c78fd051d3" STYLE="fork"/>
                    </node>
                    <node TEXT="【取消】" ID="82ffc0a7a32dab5e4f205b747e3c7715" STYLE="fork">
                      <node TEXT="关闭弹框" ID="47f162db5a4e43aea94151893b6c97bf" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="可能需要回多次" ID="fe217ae0edda66b8fb92cb5587a92687" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="底盘控制" ID="98d09a99c03964e20ec6e45164d2d70c" STYLE="fork">
                <node TEXT="向上箭头按钮" ID="41a53567a5b2bf810c3a1d9f9cd076fb" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘向前移动，下方显示：移动中..." ID="89713da75564b4582934c1ff9329c29b" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="4392a44e80238344866f10fafde35bca" STYLE="fork"/>
                </node>
                <node TEXT="向下箭头按钮" ID="e3d5fff7210e737a01ac0b3dc1a3de2b" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘向后移动，下方显示：移动中..." ID="19dd34eeb8d9cd17bb2a44b9bca5df10" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="494fec195b21c19a7edafdc3431e3410" STYLE="fork"/>
                </node>
                <node TEXT="向左箭头按钮" ID="a6b930000240decb35a2ea2b0a08033e" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘向左移动，下方显示：移动中..." ID="d158e162a92ce20140ca3ea9f24b1c00" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="510898ad7bd8ca490f3544f7dbb4e429" STYLE="fork"/>
                </node>
                <node TEXT="向右箭头按钮" ID="d28e358a8a22a4992affb3a3b789d630" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘向右移动，下方显示：移动中..." ID="e78cd3ecaa09256b96d9105b87dd9139" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="7d46b8a4c245f9a943b11ba4f31e2806" STYLE="fork"/>
                </node>
                <node TEXT="左转按钮" ID="b6bcc0c48b700bf6f43b9bbb70fa7aea" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘左转，下方显示：左转中..." ID="217db57693cef0544648d81ec144d84a" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="c80663140756ccf770acdb9850222b46" STYLE="fork"/>
                </node>
                <node TEXT="右转按钮" ID="5c57f68398f344aa2b10d884f9f95c6b" STYLE="fork">
                  <node TEXT="按住按钮 控制底盘右转，下方显示：右转中..." ID="2de1a64296bd30dc6ff65415b99deffa" STYLE="fork"/>
                  <node TEXT="松开按钮停止移动，下方显示：已停止。" ID="fa96a2c3fb57eff9660c6a0af47c722f" STYLE="fork"/>
                </node>
                <node TEXT="移动速度[下拉]" ID="62f0b0834d7fb561f3e2c444b386e06c" STYLE="fork">
                  <node TEXT="慢 25%" ID="f0d497ead43e3c43c7ae1fc1899e160a" STYLE="fork"/>
                  <node TEXT="中 50%" ID="7323bd7a05c7088a22c3fe43cdeef5c8" STYLE="fork">
                    <node TEXT="默认" ID="9969360fe6b31db24e7c3a1c5eb07d01" STYLE="fork"/>
                  </node>
                  <node TEXT="快75%" ID="495e2499de604ab3c4ee5c937cc781f5" STYLE="fork"/>
                  <node TEXT="最快 100%" ID="47ec18e3b9b8fd607f1bea9a95e72c7c" STYLE="fork"/>
                  <node TEXT="控制底盘移动速度选项" ID="e37df430278a2410f083f84d1596f7d5" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="场景（林禹成）" ID="0556ba051bd44bcd99ecb73f13b9a5ce" STYLE="fork">
            <node TEXT="数据采集tab下，未开始采集，杀掉APP/没电关机/APP闪退，重新打开" ID="d5e6212cad71f9bbfe27de18fa7080fa" STYLE="fork">
              <node TEXT="直接进入数据采集tab" ID="4c920f749f297ff34089e18018f2ab6c" STYLE="fork"/>
            </node>
            <node TEXT="数据采集tab下，正在采集，杀掉APP/没电关机/APP闪退，重新打开前完成了本次采集且又采集了多条数据，此时正在采集时，重新打开APP" ID="8eb2392956ba0bd7ef345fb641dfe075" STYLE="fork">
              <node TEXT="直接进入数据采集tab，自动进入录制中" ID="0ac5224b8d5c0ddb33a18abf4e9b4b54" STYLE="fork"/>
              <node TEXT="采集任务和采集人员显示正在进行的任务和采集人员" ID="1abc3a82c1b08fe15089f4008417e191" STYLE="fork"/>
              <node TEXT="不影响刚才采集的数据，VR上可控制开始和结束，保存到机器人本地，数据不会丢失，再次采集时，采集的数量获取机器人本地的数量" ID="5736cf41a5a83c4e4cddc2b14cb4bf4e" STYLE="fork"/>
            </node>
            <node TEXT="查看数据tab下，回放中，杀掉APP/没电关机/APP闪退，重新打开" ID="6ada4e36d1a22febd9f620452eb0f665" STYLE="fork">
              <node TEXT="直接进入查看数据tab，不选中采集数据" ID="c41fb6f52ff8791d654e11ccd479a735" STYLE="fork"/>
            </node>
            <node TEXT="手动模式tab下，回home点移动中时，杀掉APP/没电关机/APP闪退，重新打开" ID="a17aa5f8be4604bf2f3ec96bf49115dc" STYLE="fork">
              <node TEXT="直接进入手动模式tab" ID="078f34060f4ba8b48c04927b3f57eb0d" STYLE="fork"/>
              <node TEXT="不影响刚才正在进行的回home点移动" ID="f7d8c0a488d991b1e94d10e9fd63a93a" STYLE="fork"/>
            </node>
            <node TEXT="数据采集tab下，正在采集，杀掉APP/没电关机/APP闪退，重新打开前完成了本次采集且又采集了多条数据，采集结束了，机器人进入待机模式，重新打开APP" ID="fa0819224fd15324f844725362826343" STYLE="fork">
              <node TEXT="进入查看数据tab" ID="ef4ed3fc39d455a60ea89bcc1fed0670" STYLE="fork"/>
            </node>
          </node>
        </node>
      </node>
    </node>
    <node TEXT="平台侧" ID="3cc6f689c3fc8c89b4a2ead5d4c90a90" STYLE="bubble" POSITION="right">
      <node TEXT="总览（封伟）" ID="e0ab6d650d7bc2b0d6dddf9f893c745c" STYLE="fork">
        <node TEXT="机器人" ID="12eb795b0f9999a79326bd8a394daf66" STYLE="fork">
          <node TEXT="总：X台" ID="13d841acdb022300035116c3cd100849" STYLE="fork">
            <node TEXT="“机器人设备”列表页中创建的数量" ID="da78cf40726e40065551beabbee3ac28" STYLE="fork"/>
          </node>
          <node TEXT="在线X 离线X" ID="b5fe670224ded31d30fcea47644ebb34" STYLE="fork">
            <node TEXT="心跳在线数量和离线数量" ID="5477f608ec0a1a7b176c4e30a85035b7" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="采集总条数" ID="f7a8d33402dba9ccefdb05a8df58f74d" STYLE="fork">
          <node TEXT="总：X" ID="dd7145b9d35a3088bd03013585567ff1" STYLE="fork">
            <node TEXT="取数据检查（s3）中的条数" ID="2be35580283eb2f37efd1c2e09a611d0" STYLE="fork"/>
          </node>
          <node TEXT="今日 X 条" ID="44612094980f26985c488433863d1aa7" STYLE="fork">
            <node TEXT="取采集任务中的采集条数" ID="72783f0a67817a2ccf5fd17f3b145807" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="任务" ID="38d1ab81376d354b00ddaabfdf9b05f3" STYLE="fork">
          <node TEXT="总：X" ID="fed829cd13e17a0c7e736fe9b70e3cf0" STYLE="fork">
            <node TEXT="统计总任务，不统计子任务" ID="2eceb708090d6d6f98e6752705de4cae" STYLE="fork"/>
          </node>
          <node TEXT="未下发X  采集中X  采集完成X" ID="9b231bd066c1291cea8c2a0b18b9d137" STYLE="fork"/>
        </node>
        <node TEXT="采集总时间" ID="45706189bb49ed6fa33785fa76949d94" STYLE="fork">
          <node TEXT="总：-h -m -s" ID="6310d5df841c21dbcf2246efb53ca796" STYLE="fork">
            <node TEXT="数据检查中“采集时长”之和" ID="7664cee19ba511fc28757ba198bfbf7e" STYLE="fork"/>
          </node>
          <node TEXT="今日 -s" ID="d2e8c4744475b83725042a0f1c2040c3" STYLE="fork"/>
        </node>
        <node TEXT="采集趋势（近7天）" ID="c761cf5190e0d5dd1a5b13b3558b1547" STYLE="fork">
          <node TEXT="采集条数tab" ID="926c05182fbe2c45d1fcae0df86e291e" STYLE="fork">
            <node TEXT="展示7天内，每天的采集条数（柱状图）" ID="62069048057a22ee0810b94ea2ba81e3" STYLE="fork"/>
          </node>
          <node TEXT="采集时长tab" ID="fecfe6f206ed7aee10c47e2556cd136e" STYLE="fork">
            <node TEXT="展示7天内，每天的采集时长（柱状图）" ID="90fa262e549a9e482644d257ef2663b3" STYLE="fork"/>
            <node TEXT="单位：h" ID="f9de94faf7bf44cec376c21e29c46438" STYLE="fork">
              <node TEXT="保留小数点后一位，向下取整" ID="3cda491be49d0213bd745cb2ea621cea" STYLE="fork">
                <node TEXT="如：378s，计算为0.105h，展示“0.1h”" ID="622e57087418ec8ebc6bc67aa2949d69" STYLE="fork"/>
                <node TEXT="如：2344s，计算为0.6511h，展示“0.6h”" ID="4b1f5a8ac88279dd1fe3f528c39e52d1" STYLE="fork"/>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="采集人员采集时长排行" ID="40e070b9f28f42d94b7298f5ac0213e8" STYLE="fork">
          <node TEXT="展示所有采集人员的采集时长" ID="41274f55d16c17a2d95dc07daa7249df" STYLE="fork">
            <node TEXT="时间单位：-h -m -s" ID="bf58f0ead02b33b60050b9a3fd275e72" STYLE="fork"/>
            <node TEXT="每行=名次+姓名+条宽+时长标签（-h -m -s）" ID="8f96d53a4aa1a19e55b5740e06c5df0c" STYLE="fork"/>
          </node>
          <node TEXT="按采集时长降序取前八位" ID="dcfff517d74668e4269bea24e846b10c" STYLE="fork">
            <node TEXT="前三名名次蓝色高亮。" ID="61e2da6aa512d5586d9a28cbd763efb0" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="采集中设备异常（近30天）" ID="72850acc77eb4f55551be5c00f2df4d1" STYLE="fork">
          <node TEXT="文案：仅记录采集过程中发生的设备异常" ID="a76fa2d0877bf64e392e3b3bfb40809c" STYLE="fork"/>
          <node TEXT="列表页" ID="bc4383d3bc4533902c481b80d1c52646" STYLE="fork">
            <node TEXT="机器人" ID="3e1b5a060f4f35e3001611dc8d8e9081" STYLE="fork"/>
            <node TEXT="设备" ID="7483b7a587484e6d129f8b5ed1545333" STYLE="fork"/>
            <node TEXT="发生时间" ID="e59d9c6c04f4476bc32f413b6a93b177" STYLE="fork"/>
            <node TEXT="采集任务" ID="66d8e32b1e0cc0c9b117a93617ed501c" STYLE="fork"/>
          </node>
          <node TEXT="多数据时显示小滚动条" ID="1ce510900e62718c8e60134382ca639d" STYLE="fork"/>
        </node>
        <node TEXT="采集中的任务" ID="4191393ccd617f32e29020ff1708f59f" STYLE="fork">
          <node TEXT="文案：进度为端侧同步条数，非已标注条数" ID="a6928665a661281cdfe0e882173e2a45" STYLE="fork"/>
          <node TEXT="列表页" ID="fcdd89aa789fd75b192d3674564adeda" STYLE="fork">
            <node TEXT="任务" ID="598d4474bceac22e149a0d645332c0d8" STYLE="fork">
              <node TEXT="可能存在列表页中任务相同" ID="b1e9fc8ad7af44cebc6a7fcc0c637e33" STYLE="fork"/>
            </node>
            <node TEXT="采集人员" ID="77983ba4eb65176581c90a3b45b03a9f" STYLE="fork">
              <node TEXT="显示采集人员姓名" ID="80b5dc4ae443ea09da752c6801ae3dc0" STYLE="fork"/>
            </node>
            <node TEXT="机器人" ID="49ca31e54527bc8b3373e31aa80f6b36" STYLE="fork">
              <node TEXT="显示任务下发的机器人编号" ID="b2050cd7217db76632b6beebd2dedbfe" STYLE="fork"/>
            </node>
            <node TEXT="进度" ID="8404daa3555e56216544f83e38d24208" STYLE="fork">
              <node TEXT="A/B" ID="710c9ba8c2a068efe579ab8a57d9fdfb" STYLE="fork">
                <node TEXT="A为该采集员在该任务下的已采集数量" ID="77670bcbd9ede78c6400205d26330f72" STYLE="fork"/>
                <node TEXT="B为创建任务/添加子任务时输入的人员目标数量" ID="38e561be0b55eb5c1f3b202e07a6f175" STYLE="fork"/>
                <node TEXT="A可能会超过B的数量" ID="29ade7bb61043f593d84ac4264acc5fe" STYLE="fork">
                  <node TEXT="不做限制" ID="250c0b4e65b72655dabdfac0da0454c5" STYLE="fork"/>
                </node>
              </node>
            </node>
            <node TEXT="状态" ID="c608231fa92e43e2bf366de866cd2abb" STYLE="fork">
              <node TEXT="采集中" ID="66fc4ba962287bb276fdf8b27dee0c71" STYLE="fork"/>
            </node>
          </node>
        </node>
      </node>
      <node TEXT="采集任务（林禹成）" ID="829b53e9dfdb4920f1e4ab435182a333" STYLE="fork">
        <node TEXT="任务列表tab（默认选中）" ID="3ec805fc9fe267d861cc31fa6a184204" STYLE="fork">
          <node TEXT="筛选项" ID="8ad941ad8dfbb1d55d87384422b5f046" STYLE="fork">
            <node TEXT="任务名称/描述/编号" ID="25cee35eef0052b254656b90913a54c9" STYLE="fork">
              <node TEXT="默认为空" ID="8c6afacc639116e45ca2c28a50ef491c" STYLE="fork"/>
              <node TEXT="模糊查询" ID="2a11cf02cd238e4fb35147011426d9f7" STYLE="fork"/>
            </node>
            <node TEXT="状态" ID="fd5150a911172573e189e63919d0f638" STYLE="fork">
              <node TEXT="全部" ID="0b2f4b058bfc49cbcc1854122b13d8e8" STYLE="fork">
                <node TEXT="默认选中" ID="0a8775bbb0e122cda520b58dc7b3bd19" STYLE="fork"/>
              </node>
              <node TEXT="待下发" ID="42fdb544740bbbd12727db45a3ad5768" STYLE="fork">
                <node TEXT="筛选出所有待下发的任务" ID="19e7dfc25d42662be40aaedfb32ead30" STYLE="fork"/>
              </node>
              <node TEXT="采集中" ID="8e4663500215fec2679c6a9b58044301" STYLE="fork">
                <node TEXT="筛选出所有采集中的任务，包含主任务和子任务" ID="2f723b9a33ab96bdb75e6e3fc6d4477b" STYLE="fork"/>
              </node>
              <node TEXT="采集完成" ID="50828b93709544a715f82daa809d8b27" STYLE="fork">
                <node TEXT="筛选出所有采集完成的任务，包含主任务和子任务" ID="e4d312849565813188b622ff600d2573" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="人员" ID="d6691a3d3ab20a23b5e49d276665fe9a" STYLE="fork">
              <node TEXT="全部人员" ID="73b1b3629e645d29a3c7b6cc1f2d115e" STYLE="fork">
                <node TEXT="默认选中" ID="4a54c45ce2f455686b5fc4d9a8bb8fe8" STYLE="fork"/>
              </node>
              <node TEXT="下拉数据来源：用户tab下角色为“采集员”的所有用户姓名" ID="599ca79008df5d29ac1a041c8ce3bcdc" STYLE="fork">
                <node TEXT="包含禁用的人员" ID="240979a0313961347301e1a2d5e094db" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="机器人" ID="5535a014491ccbd41caf63b7d3512f4d" STYLE="fork">
              <node TEXT="全部机器人编号" ID="99c7a9c9d4df2e299335c79e3f3e3105" STYLE="fork">
                <node TEXT="默认选中" ID="ac227d7e9525ed82fb01d066cb7f03a8" STYLE="fork"/>
              </node>
              <node TEXT="下拉数据来源：机器人设备tab下所有的机器人编号" ID="081a9478e0cedc09416c3fa3441ae54e" STYLE="fork"/>
              <node TEXT="显示：机器人编号·设备名称" ID="353fd011b6b925e8b549edc85e052055" STYLE="fork"/>
            </node>
            <node TEXT="【查询】" ID="c55ffd99a3d340b377cc84deb2b4ea71" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="c8e4346cd9a2ae1609fcc2d6e68ce61f" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="fc47ee667d97e44ee9fe4d0a19b6856a" STYLE="fork">
              <node TEXT="重置为默认状态，查询所有" ID="421c92f4200e50a88f6a86730c89d90e" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【创建任务】" ID="68fbbd3c182c084d71fbc032df5a7215" STYLE="fork">
            <node TEXT="点击弹出“创建任务”弹框" ID="d36e1ebb469d6c7a997493ce01963ca1" STYLE="fork">
              <node TEXT="* 任务名称" ID="dff3ea27745c8a9e8e2cd0b6bdf8bdaf" STYLE="fork">
                <node TEXT="必填项" ID="a068462f95662b6310eb2490d2587627" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字、-、_" ID="fe6f13bcc29f43e853560352c8eacc35" STYLE="fork"/>
                <node TEXT="长度&lt;=32" ID="c370aedf8aab544c02807ae3604266b4" STYLE="fork"/>
              </node>
              <node TEXT="任务说明" ID="a5d9f7290a1e4afbbd16741618eb5a4d" STYLE="fork">
                <node TEXT="富文本编辑器" ID="e806d25fb837f10bff04f5a5f3cd2ff6" STYLE="fork"/>
                <node TEXT="图片限制" ID="99f386005d078d828458330e77fa4462" STYLE="fork">
                  <node TEXT="&lt;=10M" ID="5eb5598d0b3d534d0fd7542edafeea80" STYLE="fork"/>
                </node>
                <node TEXT="视频限制" ID="cd1c656fccf1a1a2d115c13890083c9f" STYLE="fork">
                  <node TEXT="&lt;=100M" ID="59d91e161fac0adfbdbbb3fe64881b7a" STYLE="fork"/>
                </node>
                <node TEXT="输入框长度限制&lt;=100000" ID="db0814c24eb8604023e8000fff20ffc0" STYLE="fork"/>
              </node>
              <node TEXT="文案：任务只含编号、名称和任务说明，不含人、不写条数。保存后在任务列表点「添加子任务」选人、机器人和目标条数。" ID="077e8f9ced0379adb2aab1839d47cbea" STYLE="fork"/>
              <node TEXT="【取消】" ID="52030ff7c2b5af8bb446429b6bb2803d" STYLE="fork">
                <node TEXT="不保存，关闭弹框" ID="90ccfb2dbe7ffc1388ecf94f0ad14f2a" STYLE="fork"/>
              </node>
              <node TEXT="【确认创建】" ID="8d58ee17efd6bdf30bc67c03dbb75e0d" STYLE="fork">
                <node TEXT="校验" ID="b510e8f28c76c77bcbd39650b29bcf66" STYLE="fork">
                  <node TEXT="必填项校验" ID="d7df9aad2b2a9d543d851e5e3d219c07" STYLE="fork"/>
                  <node TEXT="任务名称不允许重复" ID="35f4f42993eb542be847891f6fe008c9" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="列表页" ID="b743f8bb934c7ba1ccf68ab2e763ea28" STYLE="fork">
            <node TEXT="展开/收起icon" ID="9549d393f3a9ccd852606e997d98e481" STYLE="fork">
              <node TEXT="点击可一键展开/收起所有子任务" ID="982055ad77f364d7765650d979a14078" STYLE="fork"/>
              <node TEXT="已展开的任务在筛选/翻页后仍保持展开" ID="39121b9c8badd147b294212cc11793ea" STYLE="fork"/>
            </node>
            <node TEXT="主任务" ID="bfb1913f24fbb259d8b76463bf832963" STYLE="fork">
              <node TEXT="+" ID="1dc88eb3e8152977bf1fbe6604a0b9e0" STYLE="fork">
                <node TEXT="无子任务时，不展示" ID="01b0fc8e1535760e1ea97b296d73ed92" STYLE="fork"/>
                <node TEXT="有子任务时，点击可展开查看子任务" ID="b0e4d84dbf0bebd292e3f1d96daa0f51" STYLE="fork"/>
              </node>
              <node TEXT="任务编号" ID="53eaed4ee1759af3eb4d975e23f2f919" STYLE="fork">
                <node TEXT="创建任务成功后，递增" ID="953508937d37c5f6df4360c98770fae5" STYLE="fork"/>
                <node TEXT="格式：T-年月日-xxx，如：T-20261002-001" ID="ce7bc4adca3cd5d715c8ca15e8a2e80a" STYLE="fork"/>
              </node>
              <node TEXT="任务" ID="19b6082950dcae7c30a17ebdb599caa8" STYLE="fork">
                <node TEXT="与创建任务时输入的任务名称一致" ID="0a60805c4301bdbde171e8f5b49de6bd" STYLE="fork"/>
              </node>
              <node TEXT="子任务数" ID="ba4156b4c95258e76ef1fe15e50252c5" STYLE="fork">
                <node TEXT="显示子任务数量" ID="36e082da9fe81ecefd832a13dd8ee279" STYLE="fork"/>
              </node>
              <node TEXT="进度" ID="c31aad1dc40f6899c20ba425ca81ba45" STYLE="fork">
                <node TEXT="A/B" ID="cd4637c23a4fde538ec20f37db86e4ae" STYLE="fork">
                  <node TEXT="A为该任务下 子任务中 已采集数量的总和" ID="e3f47c5d0cc76b32987496c9bbb9ce93" STYLE="fork"/>
                  <node TEXT="B为该任务下 子任务中 目标数量的总和" ID="aa61200f1f8f678500eadbd234180cf3" STYLE="fork"/>
                  <node TEXT="A可能会超过B的数量" ID="0d9b3b75186bee0e542c1831caad7c9a" STYLE="fork">
                    <node TEXT="不做限制" ID="2bd683b30169bacd901f2cb944451bfa" STYLE="fork"/>
                  </node>
                </node>
              </node>
              <node TEXT="状态" ID="09a83b07879ad397d8080eac07edecf4" STYLE="fork">
                <node TEXT="待下发" ID="157394ba5a77a42a5925fbb7b57e2813" STYLE="fork"/>
                <node TEXT="采集中" ID="1022a1caae9e8c666a85853f7958206f" STYLE="fork"/>
                <node TEXT="采集完成" ID="1ef831802d907ae126ca9004728ca10b" STYLE="fork"/>
              </node>
              <node TEXT="创建时间" ID="f4d19893a623a6d2bb675d9b13ef4896" STYLE="fork">
                <node TEXT="展示：年-月-日  时:分:秒" ID="bcbd575728cf27d50196b3d67b661c6a" STYLE="fork"/>
              </node>
              <node TEXT="操作" ID="dfb59caf6b20d3f636a6a52168ffa67b" STYLE="fork">
                <node TEXT="待下发" ID="5d90ddddd5970399018767736b69234c" STYLE="fork">
                  <node TEXT="【添加子任务】" ID="23ccc3016df5771f134be37c40a33864" STYLE="fork">
                    <node TEXT="点击弹出“添加子任务”弹框" ID="0dd502647abbd552b2df3481356e8901" STYLE="fork">
                      <node TEXT="任务" ID="fefd2c819a96881cee73b862158d5a70" STYLE="fork">
                        <node TEXT="回显置灰，不允许修改" ID="c52ab574821d21b083353297703fc2f6" STYLE="fork"/>
                      </node>
                      <node TEXT="*采集人员" ID="37da470a82c9432dfa822189a58bfd87" STYLE="fork">
                        <node TEXT="下拉数据来源：用户tab下角色为“采集员”的所有用户姓名" ID="f38de0d8ac1c41c2b2b24cbb6b8e8e61" STYLE="fork">
                          <node TEXT="单选" ID="475855900bc785d5225bac3e61ef2d77" STYLE="fork"/>
                          <node TEXT="不展示禁用人员" ID="abaf5774440f7ab8436adf24a2c91e35" STYLE="fork"/>
                          <node TEXT="不展示该任务已选择的采集人员" ID="dc19bbab3bc9c65418fad31e710c5027" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="*指定机器人" ID="4c1fb6446413c0488d655bdd145a334d" STYLE="fork">
                        <node TEXT="下拉数据来源：机器人设备tab" ID="7c08c9013de857dcc9505dfc2f63a6aa" STYLE="fork">
                          <node TEXT="单选" ID="0ff00366d5277a17ebec3bba86bbef9e" STYLE="fork"/>
                          <node TEXT="可选择与其他子任务不同的机器人" ID="b6fd6606bd4a1286c1a1bed83d4cd561" STYLE="fork"/>
                        </node>
                        <node TEXT="展示：机器人编号·设备名称·绑定构型·在线状态" ID="b9a27a1629e6d734288972bdea03bf5f" STYLE="fork">
                          <node TEXT="离线设备也可以进行选择" ID="a346401e5c38424181c4019258a797dd" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="*目标条数" ID="9f3c1029b640844fb78e631b8abf12b6" STYLE="fork">
                        <node TEXT="只允许输入数字，最大数999999" ID="6a0e894df24b5633800d46d6db87a5d9" STYLE="fork"/>
                      </node>
                      <node TEXT="【取消】" ID="846c59cbf41bbe816cbeac891b012061" STYLE="fork">
                        <node TEXT="不保存，关闭弹框" ID="a7a0fd8b25d017e053855758ab85d959" STYLE="fork"/>
                      </node>
                      <node TEXT="【添加并下发】" ID="8304f026e9954df3197baf6d6ce63099" STYLE="fork">
                        <node TEXT="校验" ID="68d73e197f42021ac47bf615f5308115" STYLE="fork">
                          <node TEXT="必填项" ID="ec77f31a28a13f25bb44dcb5ab508217" STYLE="fork"/>
                          <node TEXT="选择的机器人是否存在" ID="3ef2675bc75f1bd4bdb3e50e6f112b97" STYLE="fork"/>
                          <node TEXT="选择的采集人员是否存在" ID="7c60e4ee1215f7542f8bba88dfcc3db0" STYLE="fork"/>
                          <node TEXT="选择的采集人员是否禁用" ID="e0c50184475f673165e812887f291c00" STYLE="fork"/>
                          <node TEXT="选择的采集人员在该任务下是否已存在子任务" ID="8903b49a4aecc81f62f9f5a0388f05e2" STYLE="fork"/>
                        </node>
                        <node TEXT="成功后，自动进行下发，该主任务下新增一条刚创建的子任务，主任务和子任务状态都为“待采集”" ID="b4b416bf177c910822fe091180b91e61" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【编辑】" ID="33aba9038e8fc2e732f902ed512c1496" STYLE="fork">
                    <node TEXT="点击弹出“编辑任务”弹框" ID="aa8c3726381befd3f386172b7a36c5b5" STYLE="fork">
                      <node TEXT="* 任务编号" ID="6ace411cdf50254f1bd5feb0c2602bd2" STYLE="fork">
                        <node TEXT="回显置灰，不可修改" ID="9d9f18222b1ed15099d40810d62d8c79" STYLE="fork"/>
                      </node>
                      <node TEXT="* 任务名称" ID="7745fd1bfd5b93bba2f6d066cf7251d6" STYLE="fork">
                        <node TEXT="回显，可修改" ID="550be1da5cc5c1d251860430b8e5af71" STYLE="fork"/>
                      </node>
                      <node TEXT="任务说明" ID="17bc03ad85d3c4b3a95f5d820497868f" STYLE="fork">
                        <node TEXT="回显，可修改" ID="3762aa64b2f7d904f9b205506e477963" STYLE="fork"/>
                      </node>
                      <node TEXT="【取消】" ID="85241184ee37d6c55dc3b57048317b50" STYLE="fork">
                        <node TEXT="不保存，关闭弹框" ID="ff38d966e7bd67f1c1f996fa92e477f4" STYLE="fork"/>
                      </node>
                      <node TEXT="【保存】" ID="cde48637dcfeb28f2a27f657e48fbf87" STYLE="fork">
                        <node TEXT="校验" ID="37d68f6d117f65fd39de35c5ab50b2c3" STYLE="fork">
                          <node TEXT="必填项校验" ID="741c28a4fc8bb0ecfafb453a27a11bd0" STYLE="fork"/>
                          <node TEXT="任务名称不允许重复" ID="51d95818efcc5d345f1b68ed818d5f71" STYLE="fork"/>
                        </node>
                        <node TEXT="保存成功后，页面回显保存后的数据信息" ID="8b98fc61774007dbae78534bbf89f4a5" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【复制】" ID="473c7f7a5435d4205e1f4fd7cf82ab0e" STYLE="fork">
                    <node TEXT="点击弹出“复制任务”弹框" ID="7ef23018fec9f6eee7fd6525ccf2d4c8" STYLE="fork">
                      <node TEXT="* 任务名称" ID="10b21e7034936e8b827291e3f49d2fbd" STYLE="fork">
                        <node TEXT="回显复制的任务信息，名称后加“副本”，可修改" ID="30641f91fa47cf9e94a69546b9a97ed7" STYLE="fork">
                          <node TEXT="必填项" ID="0041eea47efee751a2f7b1b7a938e593" STYLE="fork"/>
                          <node TEXT="仅支持中英文字母、数字、-、_" ID="b7030631323fd56b9367383278607d65" STYLE="fork"/>
                          <node TEXT="长度&lt;=32" ID="eb66c889b725d2d0c1c40df7ec514530" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="任务说明" ID="34242fe699ce0bcabd0cdb391b6b8009" STYLE="fork">
                        <node TEXT="富文本编辑器" ID="814e07d04fc13f21ef8cfd00ab7c73a2" STYLE="fork"/>
                        <node TEXT="输入框长度限制&lt;=1000" ID="0e89cd9f4bef159f5db60594806627fb" STYLE="fork"/>
                      </node>
                      <node TEXT="文案：任务只含编号、名称和任务说明，不含人、不写条数。保存后在任务列表点「添加子任务」选人、机器人和目标条数。" ID="5916c132b7c518fc7d87e59027a6a831" STYLE="fork"/>
                      <node TEXT="【取消】" ID="1ee3740b1ec2e276a0e310307e535197" STYLE="fork">
                        <node TEXT="不保存，关闭弹框" ID="9937154620c8b03ed38e6f9e6a564d68" STYLE="fork"/>
                      </node>
                      <node TEXT="【确认创建】" ID="ac95e7958c73cf6d0bc771f0688b5cff" STYLE="fork">
                        <node TEXT="校验" ID="38022915a66fb5e4cdc5cb218fc0ed77" STYLE="fork">
                          <node TEXT="必填项校验" ID="3f53289cfd8ed58f8b7d32a25312c9cf" STYLE="fork"/>
                          <node TEXT="任务名称不允许重复" ID="d4aa22b57dc6506cdfac34bd554c6c1e" STYLE="fork"/>
                        </node>
                        <node TEXT="复制的任务为新创建的任务，与原任务无关联" ID="c1b98763e0603c54cab5afaa2af04e8b" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【删除】" ID="5fddf5f39b526d05bf2330cacbc04097" STYLE="fork">
                    <node TEXT="二次确认弹框" ID="850d3548e7f5bf3fa1cefd7a53ad4960" STYLE="fork">
                      <node TEXT="确认后可删除任务" ID="18e2f0751ccdd30454a42b41fc9f953e" STYLE="fork"/>
                    </node>
                    <node TEXT="校验" ID="71866a02478d363ce166e8c7527e8b49" STYLE="fork">
                      <node TEXT="非待下发状态不允许删除" ID="f60a25ee153dcecce43ba6067a7d5d5c" STYLE="fork">
                        <node TEXT="删除确认时，更改任务状态" ID="cef56f12d583802f003250daab189435" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                </node>
                <node TEXT="采集中" ID="a890b3a3f6c41f29fe891bf6622cfef9" STYLE="fork">
                  <node TEXT="【添加子任务】" ID="b6edfa2d23a6f9fe32ae44666ef4ec3f" STYLE="fork">
                    <node TEXT="点击弹出“添加子任务”弹框" ID="a256624a5ce99b1fbc19c7748f5629c3" STYLE="fork">
                      <node TEXT="任务" ID="fafe6a1eaa1d7756dae3b2a5f9aecc7d" STYLE="fork">
                        <node TEXT="回显置灰，不允许修改" ID="bb8e63df24e98d3fdc0eb420717e6c5a" STYLE="fork"/>
                      </node>
                      <node TEXT="*采集人员" ID="12e1b0b72f8727448e8a978018b22f0d" STYLE="fork">
                        <node TEXT="下拉数据来源：用户tab下角色为“采集员”的所有用户姓名" ID="defbbbbe600b20f3e7a31f0a207895a5" STYLE="fork">
                          <node TEXT="单选" ID="d92d3f80833697c92c9db0b9da423015" STYLE="fork"/>
                          <node TEXT="不展示禁用人员" ID="50f578666ae21e7eb6d58eb41c1a52e3" STYLE="fork"/>
                          <node TEXT="不展示该任务已选择的采集人员" ID="874968d40761c52571316f96c94fc34b" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="*指定机器人" ID="9df07c46d8b4bf6869a0ccc338696862" STYLE="fork">
                        <node TEXT="下拉数据来源：机器人设备tab" ID="ccb556f0933d725e7e9d637f60dee85e" STYLE="fork">
                          <node TEXT="单选" ID="67af4b7def99e3b0850c8d057de95470" STYLE="fork"/>
                          <node TEXT="可选择与其他子任务不同的机器人" ID="7097fc6b46e9ea00a790f5cde6997331" STYLE="fork"/>
                        </node>
                        <node TEXT="展示：机器人编号·设备名称·绑定构型·在线状态" ID="25fbb19ba2c28410aa8105e841f83e91" STYLE="fork">
                          <node TEXT="离线设备也可以进行选择" ID="e70542cf3ed3cd7ffdb073644e4ce7c5" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="*目标条数" ID="a256bcb4bffc470592e6e85e9f2efd31" STYLE="fork">
                        <node TEXT="只允许输入数字，最大数999999" ID="7130c368e31e50d58b9be8aca46e32ea" STYLE="fork"/>
                      </node>
                      <node TEXT="【取消】" ID="58e65baa4e82ae2cf01cea0225a8930e" STYLE="fork">
                        <node TEXT="不保存，关闭弹框" ID="c88ec809189d3f742252a3e7c17c24cf" STYLE="fork"/>
                      </node>
                      <node TEXT="【添加并下发】" ID="0556ad65e15bdb97d5feef428abfd193" STYLE="fork">
                        <node TEXT="校验" ID="8398fc50ceb91ca28dfe72c2f76d0055" STYLE="fork">
                          <node TEXT="必填项" ID="ac2929eff8fa02d19843790391f4f524" STYLE="fork"/>
                          <node TEXT="选择的机器人是否存在" ID="2519e8039c1ed186c87ef37f01c1bace" STYLE="fork"/>
                          <node TEXT="选择的采集人员是否存在" ID="ecb7f107ecd2634ab7a1ae67ad6c1836" STYLE="fork"/>
                          <node TEXT="选择的采集人员是否禁用" ID="ad0545613ae625ad997d9f46c90c6e38" STYLE="fork"/>
                          <node TEXT="选择的采集人员在该任务下是否已存在子任务" ID="b228c09f537d2684923146e9a4be3b50" STYLE="fork"/>
                        </node>
                        <node TEXT="成功后，自动进行下发，该主任务下新增一条刚创建的子任务，主任务和子任务状态都为“待采集”" ID="74770b292a9f5c1986eb79e13c9a2468" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【采集说明】" ID="93a67ad2a20ccc49f00493dcf39478cf" STYLE="fork">
                    <node TEXT="点击弹出“采集说明”弹框" ID="0ef11c0ff11675a4251659363c1d389f" STYLE="fork">
                      <node TEXT="显示创建任务时富文本编辑器中的内容" ID="42659b3f6a8a42d6a5c873b78887b268" STYLE="fork"/>
                      <node TEXT="【关闭】" ID="5ad2e0f473c060bf8e611858ccaed71a" STYLE="fork">
                        <node TEXT="关闭弹框" ID="3cd22746978e922d999d7c2a60ae0669" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【复制】" ID="3dc79908d1c60e4207a5ee8968f214d9" STYLE="fork">
                    <node TEXT="同“待下发”的复制功能" ID="407afb1a51dd0e8ff605ccdba5f48b7a" STYLE="fork"/>
                  </node>
                  <node TEXT="【标记完成】" ID="21ddf23d213cef394410cb60c146b502" STYLE="fork">
                    <node TEXT="点击可将主任务状态变更为“采集完成”，该主任务下所有的子任务状态也变更为“采集完成”" ID="33f27b1adf1827911bc8e57ede863a05" STYLE="fork"/>
                    <node TEXT="端侧任务下拉中，该任务不展示" ID="51cdcbd6dd557c9add73766cf6add734" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="采集完成" ID="f576a4a42edacaafcb9449d5ea1b2575" STYLE="fork">
                  <node TEXT="【采集说明】" ID="cb05632b724a4f3d2230edb785a54b23" STYLE="fork">
                    <node TEXT="同“采集中”的采集说明功能" ID="a6431298f523bf0ec08b8e5531b3047b" STYLE="fork"/>
                  </node>
                  <node TEXT="【复制】" ID="479210ce6d829e3b95c7e1ca3ebde1ea" STYLE="fork">
                    <node TEXT="同“待下发”的复制功能" ID="fb4831ae9f05fe2bae0e782d78661dc0" STYLE="fork"/>
                  </node>
                  <node TEXT="【重新采集】" ID="89fdf42205e7e2a2edee757b93668099" STYLE="fork">
                    <node TEXT="点击可将主任务状态变更为“采集中”，该主任务下所有的子任务状态也变更为“采集中”" ID="6599c2686b7781534146e45a07165ac2" STYLE="fork"/>
                    <node TEXT="端侧任务下拉中，可选择该任务进行采集" ID="b1d517f62b5b398529d42fee5536c613" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="子任务" ID="9545d1d38f0c98af1cb6134b968d6c70" STYLE="fork">
              <node TEXT="采集人员" ID="e3cf6e0b9f15f173ab372594551ba514" STYLE="fork">
                <node TEXT="创建任务/添加子任务时选择的采集人员" ID="956707ec3eb77bc52004bf5f8fa6770d" STYLE="fork"/>
              </node>
              <node TEXT="机器人" ID="217df77b846e91e17ef9e3093a5c0630" STYLE="fork">
                <node TEXT="创建任务/添加子任务时选择的机器人" ID="bf75dfda48f88fb97ceed29fd6390896" STYLE="fork"/>
              </node>
              <node TEXT="采集进度" ID="6cee2bef1bedd73c77996830b4b30a11" STYLE="fork">
                <node TEXT="A/B" ID="84d2cf89d1353e45f35dd87f668f6f26" STYLE="fork">
                  <node TEXT="A为该采集员在该任务下的已采集数量" ID="d14387f1412cbe54385a55afe6611f4e" STYLE="fork">
                    <node TEXT="端侧上报为主" ID="af0d8546c44638c5d9c958b9c2081b76" STYLE="fork"/>
                    <node TEXT="场景" ID="cbd7306c06c01fbe843bb318f063cd03" STYLE="fork">
                      <node TEXT="目标条数100，端侧采集了50条，端侧显示50/100，云端显示50/100" ID="f86d3d75e199b924709026d239b14d12" STYLE="fork"/>
                      <node TEXT="端侧又采集了60条，端侧显示110/100，云端显示110/100" ID="3810c0a0b85643609604544a5df3d980" STYLE="fork"/>
                      <node TEXT="将端侧数据全部拷走，端侧显示0/100，云端还是显示110/100" ID="49adf0521289e967dad8d05736f8b8fc" STYLE="fork"/>
                      <node TEXT="端侧再次采集10条，端侧显示10/100，云端也显示10/100" ID="4e967bd72af136c959af4d278076f0fc" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="B为添加子任务时输入的人员目标数量" ID="ba3d66f6eeb4c4127d9c7672ebfeed18" STYLE="fork"/>
                  <node TEXT="A可能会超过B的数量" ID="36d16499f31f0958925ae8ea62777775" STYLE="fork">
                    <node TEXT="不做限制" ID="248f405e1ab665c9acc6b9ff5f0efc8a" STYLE="fork"/>
                  </node>
                </node>
              </node>
              <node TEXT="上传进度" ID="70b717f9f7c12bd1d4b86acb0ad4c271" STYLE="fork">
                <node TEXT="A/B" ID="1bfa75a107c8892862c063cefd03cb9c" STYLE="fork">
                  <node TEXT="A为该采集员该任务采集上传到s3的数量" ID="0ae5807295311665b42256a776b99222" STYLE="fork">
                    <node TEXT="s3获取到的为主" ID="821dd99b97034158765286a214a1c1b8" STYLE="fork"/>
                    <node TEXT="场景" ID="98db62667b76853763cc94c5ade8d386" STYLE="fork">
                      <node TEXT="目标条数100，端侧采集了50条，端侧显示50/100，云端显示0/100" ID="01ead6e0b0af848869ba336ea6fbb87f" STYLE="fork"/>
                      <node TEXT="端侧又采集了60条，端侧显示110/100，云端显示0/100" ID="f4b93eb76f21a34df34937c82972ebbc" STYLE="fork"/>
                      <node TEXT="将端侧数据全部拷走上传s3，端侧显示0/100，云端显示110/100" ID="721ef6d158122b182446e6e6bd7e642c" STYLE="fork"/>
                      <node TEXT="端侧再次采集10条，端侧显示10/100，云端还是显示110/100" ID="31da2e80e51a8e5c818b55c9461e066e" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="B为添加子任务时输入的人员目标数量" ID="d1c695eae0d90ed40ec0735db07a3f2a" STYLE="fork"/>
                  <node TEXT="A可能会超过B的数量" ID="969c81c0b4b22194d68582d97d085ad7" STYLE="fork">
                    <node TEXT="不做限制" ID="d62317c3373f8ffa287d13bce95b2f89" STYLE="fork"/>
                  </node>
                </node>
              </node>
              <node TEXT="状态" ID="5f23249b1ffd4442fbb5497f55c41fc0" STYLE="fork">
                <node TEXT="采集中" ID="1625484f5b86595750f9b245286275b6" STYLE="fork"/>
                <node TEXT="采集完成" ID="ee92378964aef39aaac1fb61529bc652" STYLE="fork"/>
              </node>
              <node TEXT="操作" ID="e46af98d4f77c7d7502e4edf7c45ee8a" STYLE="fork">
                <node TEXT="采集中" ID="3f817901aacfea8861b1bf1282ce32a5" STYLE="fork">
                  <node TEXT="【采集说明】" ID="a0ff22381af522f10db2136992e68df0" STYLE="fork">
                    <node TEXT="点击弹出“采集说明”弹框" ID="58874ecd8200ff83c5fd62dea5657aca" STYLE="fork">
                      <node TEXT="显示创建任务时富文本编辑器中的内容" ID="b64f7a6636dae57420e9a73ef0712ebe" STYLE="fork"/>
                      <node TEXT="【关闭】" ID="f48758be6a4411faca199b9ff76cb4db" STYLE="fork">
                        <node TEXT="关闭弹框" ID="674df6597b627b82030aacd3a6ccc685" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="【标记完成】" ID="7804c990650b3816b9afdd467cd80f77" STYLE="fork">
                    <node TEXT="该子任务不是唯一一条采集中的子任务" ID="6a74ea002c7339c7be7ea4a31ea02918" STYLE="fork">
                      <node TEXT="点击可将该子任务状态变更为“采集完成”，主任务状态不变" ID="5aa1905f4531e9ee1b11c786a2fcb085" STYLE="fork">
                        <node TEXT="端侧任务下拉中，还可以选择该任务，但采集人员不显示该子任务的采集人员" ID="4652c049a663d2bc421c79504a2d6205" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="该子任务是唯一一条采集中的子任务" ID="d2da7c52d29ca97cf85d9b79964c6a5e" STYLE="fork">
                      <node TEXT="点击可将该子任务状态变更为“采集完成”，该主任务状态也变更为“采集完成”" ID="e9b425001357b41830686b0c74296366" STYLE="fork">
                        <node TEXT="端侧任务下拉中，该任务不展示" ID="3355feb1644fa8b12830a7e70a25020a" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                </node>
                <node TEXT="采集完成" ID="f55ac6f52841799dfe9564e6176a819c" STYLE="fork">
                  <node TEXT="【采集说明】" ID="b0f47c01156d31c19656c0ea5f077acd" STYLE="fork">
                    <node TEXT="同“采集中”的采集说明功能" ID="a0e17d4803eb34b550b676886a69402f" STYLE="fork"/>
                  </node>
                  <node TEXT="【重新采集】" ID="35f13e63475780b1ba0f1af25ba3ebd4" STYLE="fork">
                    <node TEXT="点击可将该子任务状态变更为“采集中”，该主任务状态也为“采集中”" ID="3927d1bee65b24767efac50f3dbb9ed4" STYLE="fork">
                      <node TEXT="端侧任务下拉中，可以选择该任务，该采集人员" ID="80665a72eff73eba1ee13387184fde2d" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="下发记录tab" ID="b723eefc741df18fe04885e27a16f70c" STYLE="fork">
          <node TEXT="筛选项" ID="460090aea31937e2ed0b99cebbf08c67" STYLE="fork">
            <node TEXT="任务名称" ID="47d4a5d07614e04e0ebd23500740ded5" STYLE="fork">
              <node TEXT="模糊查询" ID="7d252d23ab3d5505e907b966606e1def" STYLE="fork"/>
            </node>
            <node TEXT="人员" ID="7665ae4647aae8364a82c6f21feed469" STYLE="fork">
              <node TEXT="全部人员" ID="55e865630bb6b9b76f5bbf2713bf221b" STYLE="fork">
                <node TEXT="默认选中" ID="e881eed81aa96451deacb2dabb60706a" STYLE="fork"/>
              </node>
              <node TEXT="下拉数据来源：用户tab下角色为“采集员”的所有用户姓名" ID="8684ee9442397d6edff8bdbcd34012e6" STYLE="fork">
                <node TEXT="包含禁用的人员" ID="cf67d251524cbd0cc6ab90c5f2f7c8f6" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="【查询】" ID="9927b9a60425ef6e380117c745c396b6" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="ced20230a972d156fa32f331590b17ac" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="77ed4371ea96aa343910e54542c1cf17" STYLE="fork">
              <node TEXT="重置为默认状态，查询所有" ID="6a9637720b4aac51f656af8da3e0b817" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="列表页" ID="c19694de448908697e72b34aa7877b83" STYLE="fork">
            <node TEXT="时间" ID="77b6244dea32201fa404c7dfc86f1def" STYLE="fork">
              <node TEXT="任务下发的时间" ID="424d5e4dbc3fd1f8d695ff05a4c2b2a2" STYLE="fork">
                <node TEXT="创建任务/添加子任务的时间" ID="d191c04056e5f8b927f629660df6c0ab" STYLE="fork"/>
              </node>
              <node TEXT="显示：年-月-日 时:分" ID="ef8f017a24717e69f638097c751133cb" STYLE="fork"/>
            </node>
            <node TEXT="任务" ID="4a68e2894b7349ae9f6f648c535b2e57" STYLE="fork">
              <node TEXT="下发任务的名称" ID="cc17eccef758ef18d5b1776f1a9a60ab" STYLE="fork"/>
            </node>
            <node TEXT="下发人员" ID="c5360eadf527a2cb7ba987e8c59e2a9a" STYLE="fork">
              <node TEXT="下发选择的采集人员" ID="2f52ad8b51e51f9bd3d944a5f2c5eb60" STYLE="fork"/>
            </node>
            <node TEXT="机器人" ID="b44cd5aca9e0d971b918e46dd7d209fe" STYLE="fork">
              <node TEXT="下发选择的机器人编号" ID="23e9ef76bf3f1c63739de4ec07532c96" STYLE="fork"/>
            </node>
            <node TEXT="结果" ID="c4c492a70f242e88c2ff50822548d872" STYLE="fork">
              <node TEXT="已下发" ID="f45404d8ff3bd3ac9b0f86e93ee1e5c0" STYLE="fork"/>
            </node>
            <node TEXT="排序：按照下发时间倒序" ID="f03702b4be5944e2f1db63c895e863c4" STYLE="fork"/>
          </node>
        </node>
      </node>
      <node TEXT="数据检查（封伟）" ID="f8205c0ba6a22b893dd4c97e0fa34952" STYLE="fork">
        <node TEXT="数据来源" ID="a10b75409a5b0d355361e9c728aabd14" STYLE="fork">
          <node TEXT="对应的S3目录中有该任务的采集数据时，获取该任务所有的采集数据" ID="cdd6ed5273f190ff48d6626ae0e6ecf3" STYLE="fork"/>
          <node TEXT="与任务的云端状态无关，只要该任务的S3目录中有采集数据就展示" ID="156742fc30f05ee940e626b0d6ea6e1c" STYLE="fork"/>
        </node>
        <node TEXT="筛选项" ID="3d7e0206137d6c3930fcddc8c23f5bde" STYLE="fork">
          <node TEXT="任务名称/采集人员" ID="b35ac567f6feb7f63befa5e21360f37c" STYLE="fork">
            <node TEXT="默认为空" ID="087c934bfd35ad172f20657aeb08b0bc" STYLE="fork"/>
            <node TEXT="模糊查询" ID="e4f17ac6e4c2889db68fe8c92f1c472f" STYLE="fork"/>
          </node>
          <node TEXT="采集机器人[下拉框]" ID="e23e0a2ca449a90e06e5edd2ab1d7210" STYLE="fork">
            <node TEXT="全部" ID="521cd8a3d931bdd9331f91dd66d4ce49" STYLE="fork">
              <node TEXT="默认选中" ID="c736381cfe92bd68db9f011aab467f86" STYLE="fork"/>
            </node>
            <node TEXT="下拉数据来源：机器人设备tab下所有的设备名称" ID="6d2ca3df71322dcd3006e49ee303aaef" STYLE="fork"/>
          </node>
          <node TEXT="【查询】" ID="96ffeb988e2047529f216ca9b15d8b2b" STYLE="fork">
            <node TEXT="列表页筛选出符合条件的数据" ID="61df28563418fca535d78d7d747ad668" STYLE="fork"/>
          </node>
          <node TEXT="【重置】" ID="28428c1d413bc373b1c047eca34a9daf" STYLE="fork">
            <node TEXT="重置为默认状态，查询所有" ID="13fcdb1eee70d884e21f76dcd9d90d83" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="列表页" ID="9dabfa1dd5d20a8dfeebe592655594e4" STYLE="fork">
          <node TEXT="主任务" ID="b23bf3f380bacd95440add7b6247f6bf" STYLE="fork">
            <node TEXT="任务" ID="af7ccffeb36a643dcacb5f8c9c910922" STYLE="fork">
              <node TEXT="采集任务中创建的任务名称" ID="a33b0030bd83761a898622a1ce0a95b7" STYLE="fork"/>
            </node>
            <node TEXT="采集时长" ID="188f72c261fe2433c232ad51798f84c0" STYLE="fork">
              <node TEXT="该任务的总采集时长" ID="6d58778082faebb097398aaf74676584" STYLE="fork">
                <node TEXT="子任务采集时长相加" ID="19170ea7191d955d4e93bf820e31fe58" STYLE="fork"/>
              </node>
              <node TEXT="显示：x时x分x秒" ID="74dc59a45753c257efeb43f6334b07e0" STYLE="fork"/>
            </node>
            <node TEXT="标注时长" ID="587ee1845884e0e8a06f2bb34c761f9a" STYLE="fork">
              <node TEXT="该任务的总标注时长" ID="6f3b7c6eada77da9f9daf08f04b57467" STYLE="fork">
                <node TEXT="子任务标注时长相加" ID="deb6382bb72207f68eaf1cb442fa057c" STYLE="fork"/>
              </node>
              <node TEXT="显示：x时x分x秒" ID="458e6cb28897aa879bfcef134527ea1a" STYLE="fork"/>
            </node>
            <node TEXT="大小" ID="eae01d75d356995676f06cada5b2600b" STYLE="fork">
              <node TEXT="该任务的总采集大小" ID="6620b7d3501b48efbff335606e180d4f" STYLE="fork">
                <node TEXT="子任务大小相加" ID="834bb3dd173058ed33202d2518c61515" STYLE="fork"/>
              </node>
              <node TEXT="单位：GB或MB" ID="82a74e0bed9f108bc245d016324a3080" STYLE="fork"/>
            </node>
            <node TEXT="自动标注" ID="a1e84f291b00487998f0903726b03db2" STYLE="fork">
              <node TEXT="未标注" ID="c1838284dccdd165e2e24a528e0ed1b9" STYLE="fork"/>
              <node TEXT="已标注" ID="0350f89f27f153f00d33b40c4d37a047" STYLE="fork"/>
            </node>
            <node TEXT="操作" ID="979049b422dc43e03dcb8d70c32ca49a" STYLE="fork">
              <node TEXT="【读取】" ID="7555172e6c55c8edfc5dc0070fac67a2" STYLE="fork">
                <node TEXT="进入详情页，tab选中任务下第一个子任务的采集人员+机器人编号" ID="a073d8574c81b6e91e15a32d5f8f0796" STYLE="fork">
                  <node TEXT="顶部显示" ID="5201af042fc2108c421522e0c810d874" STYLE="fork">
                    <node TEXT="任务编号" ID="39ed0d3dbd210c722211e68137271736" STYLE="fork">
                      <node TEXT="回显" ID="23b53505663236d9291f9189520a3c0e" STYLE="fork"/>
                    </node>
                    <node TEXT="任务状态" ID="434bf51482a7d29516bc1c37cc57226b" STYLE="fork">
                      <node TEXT="回显" ID="07799954e9e87c7473bf7bb90cd3cc86" STYLE="fork"/>
                    </node>
                    <node TEXT="任务名称" ID="afc03f1fbce7ce60cfaa2abdd7adc293" STYLE="fork">
                      <node TEXT="回显" ID="f9d743ffe8f73b0e3b43a90dbb3ffeb8" STYLE="fork"/>
                    </node>
                    <node TEXT="采集时长" ID="977f8e1e64e6721092a3996309e5ff51" STYLE="fork">
                      <node TEXT="显示该子任务的采集时长" ID="9ff713fb6b114daa87a733a09c755340" STYLE="fork"/>
                    </node>
                    <node TEXT="标注时长" ID="652444bab2e9f770a34d25baffcd409e" STYLE="fork">
                      <node TEXT="显示该子任务的标注时长" ID="39f91786c50175213b09188f31fd4166" STYLE="fork"/>
                    </node>
                    <node TEXT="【返回列表】" ID="b2b1ceb653be79c938e5f46a106a3d58" STYLE="fork">
                      <node TEXT="点击返回数据检查列表页" ID="78c7884d3474bcfb4363164e900b7f8e" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="子任务tab切换" ID="59a2ef509e06edc27998dd8314cf3fdb" STYLE="fork">
                    <node TEXT="显示该主任务下，所有子任务tab" ID="88383ea54f92c8128e13ed9c280d6967" STYLE="fork">
                      <node TEXT="格式：采集人员名称+机器人编号" ID="bf9ba127e9a69a13b29ba08259a1cba8" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="Episode 列表" ID="e02ce664e08a4f5ac45bb9dee7501d16" STYLE="fork">
                    <node TEXT="共 X 条 &lt;" ID="9b67c952951cfcd5677404e434f45506" STYLE="fork">
                      <node TEXT="显示该子任务采集的总条数" ID="b22d593e40fa03f06170518c37f829fc" STYLE="fork"/>
                      <node TEXT="点击&lt;可收起Episode 列表" ID="fb915139c78ce8ce1a1ab8fa6845dd87" STYLE="fork"/>
                    </node>
                    <node TEXT="搜索 episode 编号" ID="58deec50146947501db234b52757eae8" STYLE="fork">
                      <node TEXT="Episode编号模糊查询" ID="962b5ae20ba7b13b219e069b47f35285" STYLE="fork"/>
                    </node>
                    <node TEXT="下拉状态" ID="220cd5903aefb88a79f3ab6256b87687" STYLE="fork">
                      <node TEXT="已标注" ID="1698f4171e7cc40db2ecb834643a0d37" STYLE="fork"/>
                      <node TEXT="待标注" ID="c8a29e69a149d53b361fcd7bb43640d1" STYLE="fork"/>
                    </node>
                    <node TEXT="列表" ID="940d9ea721f43d270a1b9167f22b0eaf" STYLE="fork">
                      <node TEXT="展示：待标注/已标注  episode名称 · 时长 · 大小 【删除】" ID="1f411fac05e82ce53c3e088e1cf582b5" STYLE="fork">
                        <node TEXT="点击删除，二次确认后删除数据" ID="850d9a8b22c85f6ba3bbf7bb3e58b305" STYLE="fork"/>
                        <node TEXT="可直接删除s3上的数据" ID="0cc75bdf84c916ce2a16d8bce8ddd407" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="回放区域" ID="52f19b1d109b7f8ecc263b12dce751aa" STYLE="fork">
                    <node TEXT="顶部" ID="6326a6484ff430d5f6da42d6e6aaea74" STYLE="fork">
                      <node TEXT="显示：回放 · [时长]" ID="bb4df2a4acc240e42bf1a7a8ab00843e" STYLE="fork"/>
                      <node TEXT="【上一条】" ID="826912076cf35c70da68153dbf0af555" STYLE="fork">
                        <node TEXT="点击可切换到上一条Episode" ID="ffd9c06bad21ee02dac37e3c8c9e6d73" STYLE="fork"/>
                      </node>
                      <node TEXT="【下一条】" ID="3087d2903027bf871eedee966332e274" STYLE="fork">
                        <node TEXT="点击可切换到下一条Episode" ID="4e20d60dcab4a0c2c36ce7df3a2dd690" STYLE="fork"/>
                      </node>
                      <node TEXT="【详情】" ID="38a3cc456ddc65205406c18441873a26" STYLE="fork">
                        <node TEXT="点击展示本条信息，隐藏四路相机画面" ID="4d9d443c9457814d587742e0ae9407ea" STYLE="fork">
                          <node TEXT="任务名称" ID="f7440058813e3e2ed234aa60e4b93c3a" STYLE="fork">
                            <node TEXT="回显任务的名称" ID="ec0219ddc558277c34ad740c9d588d29" STYLE="fork"/>
                          </node>
                          <node TEXT="文件名称" ID="51945e5141af345a8e158fbe07e0fedb" STYLE="fork">
                            <node TEXT="该条Episode名称" ID="3860fb2c273a6e5d4e8f509af090886a" STYLE="fork"/>
                          </node>
                          <node TEXT="采集人员" ID="8428f83ebd63d14d91816085db1fd039" STYLE="fork">
                            <node TEXT="显示该子任务的采集人员" ID="1467105e16e6a3de488e7e3cabf00cbb" STYLE="fork"/>
                          </node>
                          <node TEXT="机器人" ID="1928dfd9ed5a3deb66390bb00f91d2a7" STYLE="fork">
                            <node TEXT="显示：机器人编号·设备名称" ID="9c4e4bada782d97446388246ff96a263" STYLE="fork"/>
                          </node>
                          <node TEXT="存储地址" ID="98a0b8ae93d184bbe76e6f510debf44e" STYLE="fork">
                            <node TEXT="该条在s3上的存储路径" ID="53915b4ec3e206a4a42409ad03501b1e" STYLE="fork"/>
                          </node>
                          <node TEXT="文件大小" ID="f13a9e6b6ad724d443cab1526d76e134" STYLE="fork">
                            <node TEXT="该条Episode的大小" ID="9c61f46c395312c0cc123071b88ef026" STYLE="fork"/>
                          </node>
                          <node TEXT="视频时长" ID="d785037217d6a8f6963d01b4b937842b" STYLE="fork">
                            <node TEXT="该条Episode的时长" ID="f5d2a2b61336287f3afbb881129c3ba8" STYLE="fork"/>
                          </node>
                          <node TEXT="【采集说明】" ID="de5056ec9e0d39485e759b2f6ed1ef88" STYLE="fork">
                            <node TEXT="点击弹出“采集说明”弹框" ID="38d0673057c2504c216a6188a1f65d8f" STYLE="fork">
                              <node TEXT="显示创建任务时富文本编辑器中的内容" ID="13bbfb9dace41123742c13542d1a0a02" STYLE="fork"/>
                              <node TEXT="【关闭】" ID="42b687d98a7ac18bd70bb7b28ebb5a7e" STYLE="fork">
                                <node TEXT="关闭弹框" ID="3fc09eef3e42b63cf2115b6a21c75c8f" STYLE="fork"/>
                              </node>
                            </node>
                          </node>
                        </node>
                        <node TEXT="【关闭详情】" ID="a74b1ad2ac4115e4e56b94e837e8ec85" STYLE="fork">
                          <node TEXT="点击关闭详情信息的展示，显示四路相机画面" ID="02b6348d4a53544776fd7ad05a6a3cf1" STYLE="fork"/>
                        </node>
                      </node>
                    </node>
                    <node TEXT="视频区域" ID="5e586fde871f368f5d1d24a7081004ac" STYLE="fork">
                      <node TEXT="显示主视角、左腕、右腕、全景四路相机视频 2×2" ID="cdb52abf127e2d18378c49d43c6adc18" STYLE="fork"/>
                      <node TEXT="视频滚动条" ID="bc37bdc3fad72465627878bce9a49a7b" STYLE="fork">
                        <node TEXT="点击可快速切换至某一位置" ID="e3e7fdc69f277e58de060abdde2daf60" STYLE="fork"/>
                      </node>
                      <node TEXT="视频时间" ID="8d8a4f0aace82703c8afd5045dc5257b" STYLE="fork">
                        <node TEXT="AAA / BBB" ID="70c21a0a8c66c03914c32282b1f68fdf" STYLE="fork">
                          <node TEXT="AAA：当前播放的时间" ID="d6efbfafc5dc58cc89bc93ddb24c08c4" STYLE="fork"/>
                          <node TEXT="BBB：整体视频的时间" ID="908b5a4e50efd167000b90659ee4c692" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="功能性按钮" ID="bb4aa6095b8ffbcfaca86edf31404b4b" STYLE="fork">
                        <node TEXT="|&lt;&lt;" ID="796b72ba6ec6a8df69a319ae525213e0" STYLE="fork">
                          <node TEXT="后退5秒" ID="1ab2a9fe1daa64e3de006e0768139a0b" STYLE="fork"/>
                        </node>
                        <node TEXT="&lt;" ID="5d465ee4d75761fba6bd50e0ecfc96de" STYLE="fork">
                          <node TEXT="逐帧后退" ID="543ed686478bdb2a1448aba181a654da" STYLE="fork">
                            <node TEXT="点一次一帧" ID="50b7bea542d38b6e18d8cd3db7dfa292" STYLE="fork"/>
                          </node>
                        </node>
                        <node TEXT="播放/暂停" ID="cff9c8e37bf8fe16a4d2485d3b6823c3" STYLE="fork">
                          <node TEXT="点击播放/点击暂停" ID="1f5011fae784e6fbe7d114e627278ece" STYLE="fork"/>
                        </node>
                        <node TEXT="&gt;" ID="08ff46641ffcb475679cd26be60e2abb" STYLE="fork">
                          <node TEXT="逐帧前进" ID="2d1ef88698cec71851249411778f2803" STYLE="fork">
                            <node TEXT="点一次一帧" ID="87483b3fe4e5fdd55a4760654857faab" STYLE="fork"/>
                          </node>
                        </node>
                        <node TEXT="&gt;&gt;|" ID="0ec50755466e183e0f7573a1723cb4f0" STYLE="fork">
                          <node TEXT="前进5秒" ID="fc2539be822c2418d7027b61297b6f07" STYLE="fork"/>
                        </node>
                        <node TEXT="倍速" ID="a8e5e1086f5ac55665d5f777d6a24b21" STYLE="fork">
                          <node TEXT="1×" ID="674b540b655e932fab1d8e902253fb8d" STYLE="fork">
                            <node TEXT="正常倍速播放" ID="9e70b9ffaef55c2cbe0254cde902856d" STYLE="fork"/>
                          </node>
                          <node TEXT="2×" ID="a329e6db11c8ebb245ecedc6f0de8571" STYLE="fork">
                            <node TEXT="2倍速播放" ID="68650af13e6dc10aa0543d517003bbcc" STYLE="fork"/>
                          </node>
                          <node TEXT="0.5×" ID="0c9ec97ba58f06d5ada0ee4d88abdd86" STYLE="fork">
                            <node TEXT="0.5倍速播放" ID="28fc3b0dfd1ef20dcb6da4e53cf554d7" STYLE="fork"/>
                          </node>
                        </node>
                        <node TEXT="循环播放icon" ID="f781ea56df6dafd050e3590b29dc700a" STYLE="fork">
                          <node TEXT="未选中" ID="7a4ad147187e8712a6c3b037b4827676" STYLE="fork">
                            <node TEXT="视频播放结束后，暂停播放" ID="c6588a2bf0ffa22dd4d3ae089a97d87f" STYLE="fork"/>
                          </node>
                          <node TEXT="已选中" ID="fe5fabe960e4160c5fc6f695967aa47e" STYLE="fork">
                            <node TEXT="视频播放结束后，从头开始循环播放" ID="ff3775bcef0e2fa181abe9fac7ae95b0" STYLE="fork"/>
                          </node>
                        </node>
                      </node>
                    </node>
                  </node>
                  <node TEXT="标注 · 子任务时间轴" ID="0caee801ca394112452e1f5eeb11b1db" STYLE="fork">
                    <node TEXT="待标注不展示此区域，已标注展示" ID="398b532c7520f8dfdbc5cd308c4f3331" STYLE="fork"/>
                    <node TEXT="文案：点色块定位，拖两端改起止（Ctrl 独立）· 拖动时画面跟随" ID="23ee5fecf5931d8318174776933509e0" STYLE="fork"/>
                    <node TEXT="【新增标注】" ID="3c19977834eab5238ee215faae1b4b58" STYLE="fork">
                      <node TEXT="点击新增一个标注块在最前方，显示#1标注信息，开始结束为0.0" ID="70bdfbe7614c1c44b2b84db9e2958253" STYLE="fork"/>
                    </node>
                    <node TEXT="标注块" ID="2ff52988e99bc415374d8f3520551897" STYLE="fork">
                      <node TEXT="可拖拽改变标注区间" ID="8c413882e25bfc980f434e3400ebbcf4" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="右侧区域" ID="5cc9b3db88cdd2a1db365565d455de37" STYLE="fork">
                    <node TEXT="子任务" ID="40098faef0caf84359ab0bff6b6ee281" STYLE="fork">
                      <node TEXT="【保存标注】" ID="a8be6c24b56afbb4ee46606ae8f4cc7f" STYLE="fork">
                        <node TEXT="会把S3的原始数据拉一份，在拉的数据中进行修改，S3上会存在两份数据，原始数据和修改后的数据，原始数据用于留存" ID="b764df9a4d77a461cee27c3d00088754" STYLE="fork"/>
                        <node TEXT="保存成功后，页面展示保存后的数据信息" ID="389fb0d468e20ca3d570c1f32b564509" STYLE="fork"/>
                      </node>
                      <node TEXT="【放弃修改】" ID="fa61ea9f5803d3f838e73bd4067b746b" STYLE="fork">
                        <node TEXT="点击回到该Episode的原始标注数据" ID="85bfae1e02e92a5212349a07e547a6de" STYLE="fork"/>
                      </node>
                      <node TEXT="标注信息" ID="ab09aa3eaafd3ce794c9ac38e84f84cd" STYLE="fork">
                        <node TEXT="#1/2/3..." ID="49c035bde914efa3aef80b972dad4c26" STYLE="fork">
                          <node TEXT="标注的名称" ID="789d40569ba11572a1affcf60a8c3b21" STYLE="fork">
                            <node TEXT="可修改" ID="e496d854779202923364c35aa4f920d3" STYLE="fork"/>
                            <node TEXT="长度&lt;=16" ID="5c9016129d0f37384b4b8a3209187762" STYLE="fork"/>
                          </node>
                        </node>
                        <node TEXT="【删除】" ID="0232f64ec39b63fbf5a9f540f1f7b6bf" STYLE="fork">
                          <node TEXT="点击可删除此标注" ID="3201a97b747e39d72a563769c536c3cd" STYLE="fork"/>
                        </node>
                        <node TEXT="开始" ID="b1c0c984bed7cbb148ed03ebcd25fd58" STYLE="fork">
                          <node TEXT="可修改" ID="d708a360ac0df066a0406b6685f4e9f6" STYLE="fork"/>
                          <node TEXT="单位：s" ID="d685e613fbe2ff079370c1048b50cd74" STYLE="fork"/>
                        </node>
                        <node TEXT="结束" ID="7f3ae12226ac477d5ede374138b0dd1f" STYLE="fork">
                          <node TEXT="可修改" ID="ee59e01ed59e88b81509d04c831def71" STYLE="fork"/>
                          <node TEXT="单位：s" ID="d2e0fd8c59e5a3e576012d1f37157ca0" STYLE="fork"/>
                        </node>
                        <node TEXT="描述" ID="3a77f50cd5f085663a762f0024afbc33" STYLE="fork">
                          <node TEXT="可修改" ID="5426575b76800909bd8448953a1d2c29" STYLE="fork"/>
                          <node TEXT="长度&lt;=255" ID="39ae337c08a505993c26397ce6e87a52" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="有未保存修改时离开页面弹窗提醒" ID="b074e36c0ec4cde94c922c7f8802b23a" STYLE="fork">
                        <node TEXT="保存并离开" ID="e3d218a4dfcd3112767787d0ae8c4644" STYLE="fork">
                          <node TEXT="保存当前修改，跳转点击的页面" ID="3f6a20ebb65330bbff66a83d5535af06" STYLE="fork"/>
                        </node>
                        <node TEXT="不保存" ID="bb17cec83abc35773cf2da397d0fab6f" STYLE="fork">
                          <node TEXT="不保存当前修改，跳转点击的页面" ID="c00362d10a46756ddbae967eef29b83d" STYLE="fork"/>
                        </node>
                        <node TEXT="取消" ID="aca3ddf8435978bba48ab03ea520dd68" STYLE="fork">
                          <node TEXT="关闭弹框，不保存，停留当前页" ID="5cdeadbbf03edc2e25e29394559b335d" STYLE="fork"/>
                        </node>
                      </node>
                    </node>
                    <node TEXT="左臂 · 指令" ID="ae545ef578e883a9ed95f3c4ef1a0343" STYLE="fork">
                      <node TEXT="点击可切换tab指令、状态、全部" ID="194e6ae34cbd2d30cab42fd1f6f9a628" STYLE="fork"/>
                    </node>
                    <node TEXT="右臂 · 指令" ID="206319f6d688d5b0125c624d626b4509" STYLE="fork">
                      <node TEXT="点击可切换tab指令、状态、全部" ID="51c968ddf45a7800279584a0838fe6ad" STYLE="fork"/>
                    </node>
                    <node TEXT="身体 · 指令" ID="7910ffd3919da5b40d46b70f294adf19" STYLE="fork">
                      <node TEXT="点击可切换tab指令、状态、全部" ID="a8a7b7ed8f3f9c7ed4a91598f688278b" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="子任务" ID="851961863919528aa897f14515b75692" STYLE="fork">
            <node TEXT="采集人员" ID="2e9830d520e294ca15b2a446a0f4e653" STYLE="fork">
              <node TEXT="展示该子任务的采集人员姓名" ID="4877dbf8ed2d3a6a6aa1627c74bb3fe9" STYLE="fork"/>
            </node>
            <node TEXT="机器人" ID="524c26671c0bcbce979fe362751de486" STYLE="fork">
              <node TEXT="展示该子任务下发的机器人" ID="304c58353531083efc2a383260970c66" STYLE="fork"/>
              <node TEXT="机器人编号-设备名称" ID="f782cc4bca28e91365b3130ff7f29273" STYLE="fork"/>
            </node>
            <node TEXT="采集时长" ID="7a2bb28082dca0b2501e4819f0db6107" STYLE="fork">
              <node TEXT="该子任务的总采集时长" ID="da6fda199576e78ab0cab87e0fccd641" STYLE="fork"/>
              <node TEXT="显示：x时x分x秒" ID="81fe661718e27940f644c5b1f3e8341c" STYLE="fork"/>
            </node>
            <node TEXT="标注时长" ID="4e795cb2f16341367ee7928105192c86" STYLE="fork">
              <node TEXT="该子任务的总标注时长" ID="07fa490eb5911a7ded34c0409a751009" STYLE="fork"/>
              <node TEXT="显示：x时x分x秒" ID="aea9c10e8ba256f067c241fcfe63c486" STYLE="fork"/>
            </node>
            <node TEXT="大小" ID="b460ea251e2b51c1200d9933c3cd489f" STYLE="fork">
              <node TEXT="该子任务的总采集大小" ID="ebfac331f4d3b2c20f639ed4ffe14bd4" STYLE="fork"/>
              <node TEXT="单位：GB或MB" ID="836e48334943fe5e6fd8b4a93e763095" STYLE="fork"/>
            </node>
            <node TEXT="操作" ID="c97624e43ce4f874165b53654e1dffbb" STYLE="fork">
              <node TEXT="【读取】" ID="7e0c37eab2f7d20ae6941032a1a5aea6" STYLE="fork">
                <node TEXT="进入详情页，tab选中对应的子任务采集人员+机器人编号" ID="8e6df3f5756093db0a2031b6624f0390" STYLE="fork">
                  <node TEXT="功能同主任务“读取”" ID="ab8d09e71b3c41e426781b99edfd6b94" STYLE="fork"/>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
      <node TEXT="机器人配置（封伟）" ID="b8e1ae74d944b9cb729354959986b6c7" STYLE="fork">
        <node TEXT="机器人设备tab" ID="a8c3809b5e903a2551532071d63b008f" STYLE="fork">
          <node TEXT="筛选项" ID="38187742069cfee7c2223c51f50e5d50" STYLE="fork">
            <node TEXT="搜索机器人编号/设备名称" ID="4aabf6a10cb46018fe4ec9b0dad62778" STYLE="fork">
              <node TEXT="模糊查询" ID="b9da2cce43972853f0cd449b095a8cd7" STYLE="fork"/>
            </node>
            <node TEXT="【查询】" ID="098b90d30f5d36efa7f4bab499ca3c43" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="a85d0f6dcb5dd330fb7f6034b2e31615" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="25ed25ef36ebd8a093d7a49fdd46403a" STYLE="fork">
              <node TEXT="重置为空，查询所有" ID="876acea84c306874348b857d2bfee978" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【新增设备】" ID="327e73d9a4482d3be41ee4b1a7ae5d4f" STYLE="fork">
            <node TEXT="点击弹出“新增设备”弹框" ID="82d0f22d6a2393d73d10a2734379b47f" STYLE="fork">
              <node TEXT="* 机器人编号" ID="257a2836db01456d1c3e4b0e61ed5089" STYLE="fork">
                <node TEXT="必填项" ID="c0a1d9d2893fefbb250740cd7849f106" STYLE="fork"/>
                <node TEXT="仅支持英文字母、数字、-" ID="9cb4355ab384c3581836d1246a561d49" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="2ee30d4955fd47a364a54d73164cf77e" STYLE="fork"/>
              </node>
              <node TEXT="* 设备名称" ID="0634fc6446fe1a70237b64de763e8f42" STYLE="fork">
                <node TEXT="必填项" ID="cef381a5335a4fd1e9392a0a889d9fe6" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字" ID="e40ab51bcb52eb3f92159ad4102801a8" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="dc6a70fac77cb02c5fb803f201f90753" STYLE="fork"/>
              </node>
              <node TEXT="* 绑定构型" ID="12d8ec5eca3a224f61c2333929134422" STYLE="fork">
                <node TEXT="下拉数据来源：机器人构型tab下所有数据" ID="a1d851397dac071aae7f73707ce8a188" STYLE="fork"/>
                <node TEXT="显示：构型名称（型号）" ID="3b944ba53308274b4976598de9f67412" STYLE="fork"/>
              </node>
              <node TEXT="文案：在线状态由设备心跳维护，新增后默认离线，待首次心跳上报。" ID="1e07798f4bc225922ae1f45a04339d7a" STYLE="fork"/>
              <node TEXT="【取消】" ID="544bb3f8c4e2e158c9455e147ba9e9dc" STYLE="fork">
                <node TEXT="不保存，关闭弹框" ID="7ab9cf34c081926bc342847a6c8d086c" STYLE="fork"/>
              </node>
              <node TEXT="【保存】" ID="5616dd28c680c70783f6b95a299a4679" STYLE="fork">
                <node TEXT="校验" ID="681b539f20383264bccb73fee3f04a5c" STYLE="fork">
                  <node TEXT="机器人编号不允许重复" ID="dedae8262710375a44f04ef715d9f029" STYLE="fork"/>
                  <node TEXT="设备名称不允许重复" ID="7aca9e625f40c59b9acd33633d215271" STYLE="fork"/>
                  <node TEXT="构型是否存在" ID="1faa4588fae8d447a6e1e4843c77f967" STYLE="fork"/>
                </node>
                <node TEXT="新增设备成功后，列表页显示刚创建的设备" ID="bcfefb0dd7f382a4d4156b9af8c8fa46" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="列表页" ID="b65891968183703e094d8c0935b16127" STYLE="fork">
            <node TEXT="机器人编号" ID="dd5459cd4f43cde08e82c0c2a5b1f6e6" STYLE="fork">
              <node TEXT="与新增时，填写的一致" ID="9702ffc4ce436cc03ace4a28345f0396" STYLE="fork"/>
            </node>
            <node TEXT="设备名称" ID="a460681353b2cc816faa0c42c86dc29b" STYLE="fork">
              <node TEXT="与新增时，填写的一致" ID="37acb502e1e64617940b7f79aee5d352" STYLE="fork"/>
            </node>
            <node TEXT="绑定构型" ID="02f3ecb46a3c84b6b813c691096e98e4" STYLE="fork">
              <node TEXT="与新增时，选择的一致" ID="524d2d65a26fea475c67dc58c2a01b1a" STYLE="fork"/>
            </node>
            <node TEXT="在线状态" ID="e0a6ad00df69175c675e87bdd6954088" STYLE="fork">
              <node TEXT="在线" ID="f50066f6d18f09afd49601872ff2bc2b" STYLE="fork"/>
              <node TEXT="离线" ID="38d7304ca9cf62dc12c8bfffdb75bde4" STYLE="fork"/>
            </node>
            <node TEXT="最近心跳" ID="e132f3044d140af308c31f3e115f5a00" STYLE="fork">
              <node TEXT="发生间隔＜60 秒：展示 X秒前" ID="2ed72f9c45ebf62f498973abfadb0368" STYLE="fork">
                <node TEXT="间隔 = 1s → 显示1秒前" ID="1980d50ae2629f052ae8a4891e4a7e51" STYLE="fork"/>
                <node TEXT="间隔 = 59s → 59秒前" ID="a93d02a250fcb17b8fbe3c55f5f70977" STYLE="fork"/>
              </node>
              <node TEXT="60 秒 ≤ 间隔＜60 分钟：展示 X分钟前" ID="d2b6417d53872e254bac681ba2abebf9" STYLE="fork">
                <node TEXT="间隔 = 60s（1 分钟）→ 1分钟前" ID="8f8aae1a2237c5775337c722bd272092" STYLE="fork"/>
                <node TEXT="间隔：1 分 59 秒 → 预期1分钟前" ID="1e5258d3dbe9760c30988be2aada5b29" STYLE="fork"/>
              </node>
              <node TEXT="60 分钟 ≤ 间隔＜24 小时：展示 X小时前" ID="51a0b96a6123dfd479f5c410a4742b38" STYLE="fork">
                <node TEXT="间隔 = 3600s（1 小时）→ 1小时前" ID="844060cb7dc09e87eb4c44e4b7dcfa5b" STYLE="fork"/>
                <node TEXT="间隔 = 2h59m59s → 2小时前" ID="e8fa84205500126fde23d9b7c4f64a5a" STYLE="fork"/>
                <node TEXT="间隔 = 24h → 24小时前" ID="d89e9b02961825d765a466f7052e8b38" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="操作" ID="9d48367c67c60b78a0a5c5f92e1b9bd5" STYLE="fork">
              <node TEXT="在线（未绑定）" ID="b8a75f0dd57ccadb00d37c6773834be2" STYLE="fork">
                <node TEXT="【详情】" ID="26d79a40761bb397c5292d4329c6cffc" STYLE="fork">
                  <node TEXT="点击弹出“设备详情”" ID="ad74534fad7d9ee6e896794cc89d1fc6" STYLE="fork">
                    <node TEXT="机器人编号" ID="6c87477025ac74df4901b55e9346c9ea" STYLE="fork">
                      <node TEXT="与列表页机器人编号一致" ID="11a0ae248796c8a80b39fd49cd4599e2" STYLE="fork"/>
                    </node>
                    <node TEXT="设备名称" ID="f4c952257046bf7de8b098346386d670" STYLE="fork">
                      <node TEXT="与列表页设备名称一致" ID="1e6dcbc79e15247d8d0cf1b9319a3e40" STYLE="fork"/>
                    </node>
                    <node TEXT="在线状态" ID="83b18566e00915c89813310d9e57acf0" STYLE="fork">
                      <node TEXT="与列表页在线状态一致" ID="1f8ebe1da70383613aeb1cca463de7b6" STYLE="fork"/>
                    </node>
                    <node TEXT="最近心跳" ID="ecbcab038fd00dc5c48227ebf1ffaf55" STYLE="fork">
                      <node TEXT="与列表页最近心跳一致" ID="6db264048ac1af40ab95fe18cca0f3ed" STYLE="fork"/>
                    </node>
                    <node TEXT="绑定构型" ID="d2c2ce80d9c61b1101d8ced30bb42a66" STYLE="fork">
                      <node TEXT="与列表页绑定构型一致" ID="b45ea63257df78e7ccdc52eaf522ae27" STYLE="fork"/>
                    </node>
                    <node TEXT="构型型号" ID="928b7d3517d3296f4cd9d17744c01f73" STYLE="fork">
                      <node TEXT="绑定的构型背后对应的型号" ID="e757faf97abd20268a28795628980085" STYLE="fork"/>
                    </node>
                    <node TEXT="进行中任务" ID="5e19a256a5d10ae169ad36aee9942078" STYLE="fork">
                      <node TEXT="显示该机器人绑定的任务编号、名称、采集进度、采集人员" ID="721e5f67d5ec1e615f020d9e86b2077a" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="【数据详情】" ID="5e3aa49e955e727afd237cabcad27651" STYLE="fork">
                  <node TEXT="点击进入该机器人的数据详情页" ID="8602e53018aeb2ba8b8eaad36d05b197" STYLE="fork">
                    <node TEXT="【返回】" ID="18f39edb63de2b6b262182d6d15641ec" STYLE="fork">
                      <node TEXT="点击回到列表页" ID="c9d56171d1d78e61770b54fcd7d7ecb6" STYLE="fork"/>
                    </node>
                    <node TEXT="展示：机器人编号 · 设备名称 · 在线状态 · 构型型号 " ID="ec97cff632a78098de1d3e047c8842a5" STYLE="fork"/>
                    <node TEXT="时间范围" ID="75e06816bec7a0ff77b8331e0fcf927c" STYLE="fork">
                      <node TEXT="默认最近7天" ID="9798cd80b546a315f2dc3c0a36a499cd" STYLE="fork"/>
                    </node>
                    <node TEXT="采集总数" ID="2220321e46941c578048e13bba256855" STYLE="fork">
                      <node TEXT="X 条" ID="622cd93850c2990581fe0aac4050345c" STYLE="fork"/>
                      <node TEXT="根据时间范围筛选该机器人上采集的总条数，取s3上的数据" ID="49c66725214f27e7382f084543c78631" STYLE="fork"/>
                    </node>
                    <node TEXT="采集天数" ID="b1d8fcc684e2532c907eba1d3f26fe48" STYLE="fork">
                      <node TEXT="X 天" ID="8e735d88cf430af7c9e2bdcb941959dd" STYLE="fork"/>
                      <node TEXT="根据时间范围筛选该机器人采集的天数" ID="2e92cf905df42a35895e13170a2250d0" STYLE="fork"/>
                    </node>
                    <node TEXT="采集总时长" ID="3e94e3f5f648021e074b16843ca645a1" STYLE="fork">
                      <node TEXT="根据时间范围筛选该机器人上采集的总时长，取s3上的数据" ID="dc98832597e9f8312fe1e4ed57d8bf05" STYLE="fork"/>
                    </node>
                    <node TEXT="平均单条" ID="1d0d392ab6391200cc0fb3bf6064e45c" STYLE="fork">
                      <node TEXT="采集总时长/采集总数" ID="bcf9fb0e06ef7b9b3b844be249801b2f" STYLE="fork"/>
                    </node>
                    <node TEXT="每天采集的数据" ID="63407af002c1db6ff2c783884d072be5" STYLE="fork">
                      <node TEXT="柱状图天数与时间范围筛选一致，记录每天采集的条数，相加与采集总数应该一致" ID="3ebf91369be5b8274e4eff119b215d3f" STYLE="fork"/>
                    </node>
                  </node>
                </node>
                <node TEXT="【修改】" ID="7ae3bc3d0279629b0b1b4d43e5abf408" STYLE="fork">
                  <node TEXT="可修改设备名称和绑定构型" ID="d690cc7c39f175f78779c0400eda6e4d" STYLE="fork">
                    <node TEXT="校验" ID="b7f5d181ab694b12c6f22d92aaabac9a" STYLE="fork">
                      <node TEXT="设备名称不允许重复" ID="a6440ea0fc1fd9d6eb343957af867513" STYLE="fork"/>
                      <node TEXT="构型是否存在" ID="197e3485547a2e966578992d3e243828" STYLE="fork"/>
                    </node>
                  </node>
                  <node TEXT="文案：编号与在线状态由设备心跳维护，这里不可改。" ID="2ce2aee1d40c5f7ee99ff00ecdde6ad4" STYLE="fork"/>
                  <node TEXT="【取消】" ID="b941aa7b76358767e36091bfbd9915b2" STYLE="fork">
                    <node TEXT="不保存，关闭弹框" ID="2bdca197a8ac99a2b1efbb69489f448e" STYLE="fork"/>
                  </node>
                  <node TEXT="【保存】" ID="e72f936f10f2716d0ff01877a010b23c" STYLE="fork">
                    <node TEXT="校验" ID="b8b0b6624e953bc37570e88640e3ca36" STYLE="fork">
                      <node TEXT="设备名称不允许重复" ID="184fde6547971f88b9a342974ba908f2" STYLE="fork"/>
                      <node TEXT="构型是否存在" ID="cc6ca5411c502073e6c9f479de714e04" STYLE="fork"/>
                    </node>
                    <node TEXT="修改保存成功后，列表页显示设备保存后的数据" ID="d9387a1af74473baa583799177dc3444" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="【绑定】" ID="8c98827efb592628ae9b1200e8aae1e6" STYLE="fork">
                  <node TEXT="建立通信通道，可远程接入机器人的 Linux 终端环境，成功后显示【远程终端】按钮" ID="10f8aeb750935c499801369e3cc50ed4" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="在线（已绑定）" ID="4db8b13291dbe65f4f90e01713d4257a" STYLE="fork">
                <node TEXT="【详情】" ID="31e931bc15e0c13da3f8fc28202d6eef" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的详情功能" ID="7b33c2d0a4f09328ee47bd71d7c49dc9" STYLE="fork"/>
                </node>
                <node TEXT="【数据详情】" ID="a84e837dc966e88696de9cf2df15b71a" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的数据详情功能" ID="79639b9e7024471df798d9a861b1e3c6" STYLE="fork"/>
                </node>
                <node TEXT="【修改】" ID="d262832395a22e3fcd0a08b161e0a3b5" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的修改功能" ID="b97a99eb5e6996593cf6320bfbd24621" STYLE="fork"/>
                </node>
                <node TEXT="【解绑】" ID="43905c3b919fe49a46612fee1faed603" STYLE="fork">
                  <node TEXT="断开与远程终端的连接" ID="cb99780cd85b5fb68bf019700da44c36" STYLE="fork"/>
                  <node TEXT="绑定成功后，显示【解绑】按钮，可进行解绑操作" ID="c3cd88cfe796c6ab328e8adea522b31d" STYLE="fork"/>
                </node>
                <node TEXT="【远程终端】" ID="2098f97d2bc24d576d04a3d1d6ba167a" STYLE="fork">
                  <node TEXT="设备绑定成功后，能够远程进入机器人的 Linux 终端环境进行操作" ID="ece5a17a0520584873f0329ed63613af" STYLE="fork"/>
                </node>
              </node>
              <node TEXT="离线" ID="1036f213345d5da3ee6470fa9b9d7fba" STYLE="fork">
                <node TEXT="【详情】" ID="76ab7e16dbb9906eeea94fb028617d50" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的详情功能" ID="50e66cd95b5ea13b6872201b651793ea" STYLE="fork"/>
                </node>
                <node TEXT="【数据详情】" ID="2295e5080a89d9d6b73138d2d9cd8f2d" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的数据详情功能" ID="4052cb64ca7b0e7cebc5f2191fed79eb" STYLE="fork"/>
                </node>
                <node TEXT="【修改】" ID="4a7ca671619259d557b321ec65a9c365" STYLE="fork">
                  <node TEXT="同“在线（未绑定）”的修改功能" ID="7209b0caf29d4d2626ca27fccc6107f0" STYLE="fork"/>
                </node>
              </node>
            </node>
            <node TEXT="排序：按照创建时间倒序" ID="47baab46b25c7b3ad9221300d3322bd4" STYLE="fork"/>
          </node>
        </node>
        <node TEXT="机器人构型tab" ID="22e1c2a40db154485ae26a04b5632415" STYLE="fork">
          <node TEXT="筛选项" ID="4c75eba886da094edf5368206cfdc691" STYLE="fork">
            <node TEXT="搜索构型名称/型号" ID="6a274258ffbac886a2ad8696a3f8e769" STYLE="fork">
              <node TEXT="模糊查询" ID="d51fe11269a3302760118cb003564a3c" STYLE="fork"/>
            </node>
            <node TEXT="【查询】" ID="48ea798759a830926bc80a3fbdde1fce" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="879fc071bc895a0c4f14f97554a5a0ad" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="04406c327cf44d971791bc8c4bc354d7" STYLE="fork">
              <node TEXT="重置为空，查询所有" ID="6227ec546746128504c46f69540e2ad0" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【新增构型】" ID="917ad895596dec9f50d42e30c8620bee" STYLE="fork">
            <node TEXT="点击弹出“新增构型”弹框" ID="7d7b7c9fd8fbbc5889535afbb6a5f116" STYLE="fork">
              <node TEXT="* 构型名称" ID="46f49721431c7f497b817f3b292d9390" STYLE="fork">
                <node TEXT="必填项" ID="d40063f08b93fb8aa1a3673f19c2c2a0" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字" ID="344c44e6801d0b431c1a7316fe20f1f7" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="18fa31decff2761722f776fc63477275" STYLE="fork"/>
              </node>
              <node TEXT="* 型号" ID="e1c8b3f9f37946ddf7a8ac9744db9eaf" STYLE="fork">
                <node TEXT="必填项" ID="256ab4ceb413b2bc0e4ef95fdcbc8f46" STYLE="fork"/>
                <node TEXT="仅支持英文字母、数字、-" ID="eb5f8382a0b763fd37bf450c2e6699c5" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="d70b0ea0137b4ac76accf8dd2e271708" STYLE="fork"/>
              </node>
              <node TEXT="* 描述" ID="fcaf4d8024f6db174a7edcbf181c9245" STYLE="fork">
                <node TEXT="长度&lt;=255" ID="e89876c92b4765f9a1adb4dbe167f76f" STYLE="fork"/>
              </node>
              <node TEXT="* 配置文件" ID="bc22704427994f26c89d3f6775473037" STYLE="fork">
                <node TEXT="可上传yaml文件" ID="3fd95a523f8861656ff0870faad6c952" STYLE="fork"/>
              </node>
              <node TEXT="【取消】" ID="c02da4d72e2628970498a2b5fe06568e" STYLE="fork">
                <node TEXT="不保存，关闭弹框" ID="c4498a7d20e24d6fd6f23fd891f8617d" STYLE="fork"/>
              </node>
              <node TEXT="【保存】" ID="6c0ec18d605b8c80fd388bb0f2a7bd06" STYLE="fork">
                <node TEXT="校验" ID="b766005b562d28d53834aa94f6421c94" STYLE="fork">
                  <node TEXT="构型名称不允许重复" ID="f95e515b47b7f5a64ab5d83e84632174" STYLE="fork"/>
                </node>
                <node TEXT="新增构型成功后，列表页显示刚创建的构型" ID="b89e5ae1818a5b3495070bc683e400e2" STYLE="fork"/>
              </node>
            </node>
          </node>
          <node TEXT="列表页" ID="ada2eb7078d04010ef7142cca507c758" STYLE="fork">
            <node TEXT="构型名称" ID="875bf7dc8f07a2bcba6131efbfa5ddf8" STYLE="fork">
              <node TEXT="与新增时，填写的一致" ID="7a8d5d2851c9062a92fb9c171782b123" STYLE="fork"/>
            </node>
            <node TEXT="型号" ID="e293aec4464a7131815020f85ac79d2d" STYLE="fork">
              <node TEXT="与新增时，填写的一致" ID="fb194624fbdcee3ad6159a8dfafa3d5c" STYLE="fork"/>
            </node>
            <node TEXT="描述" ID="f9feb9074684c8ffd8bbdcb6db017cf2" STYLE="fork">
              <node TEXT="与新增时，填写的一致" ID="2e2fb753fdca872ccebb0a82989dcb9f" STYLE="fork"/>
            </node>
            <node TEXT="配置文件" ID="51e4ccdfaa1ed14890fa214e21c5165e" STYLE="fork">
              <node TEXT="显示新增时上传的文件名称" ID="d628d353ef01da7497519655e9b7107d" STYLE="fork"/>
              <node TEXT="点击可查看" ID="86dc48c265c33654e2ae2124bc70787f" STYLE="fork"/>
            </node>
            <node TEXT="已绑定设备" ID="b2004c730a0a4bc3cbe259b32bac83d7" STYLE="fork">
              <node TEXT="机器人设备tab中绑定该构型的数量" ID="deacda4f5865626f5358225e0b6d934f" STYLE="fork"/>
              <node TEXT="点击可查看已绑定的设备" ID="c90f6c587b3c468d4d5c9feb2d501cfe" STYLE="fork"/>
            </node>
            <node TEXT="创建时间" ID="51ab4f43351a0f31191b8c7740c4dd34" STYLE="fork">
              <node TEXT="展示：年-月-日  时:分" ID="453d0bb460f3ea73212680a36faf07e2" STYLE="fork"/>
            </node>
            <node TEXT="操作" ID="19f2c00f8449e626b26f49cf21901351" STYLE="fork">
              <node TEXT="【详情】" ID="75712c4f1ddbfbd089b17912f364b892" STYLE="fork">
                <node TEXT="点击弹出“构型详情”" ID="71d61da7d3ea71e2895081dbf85a1017" STYLE="fork">
                  <node TEXT="构型名称" ID="a37640782a9fd9d80b137f7d73255ac6" STYLE="fork">
                    <node TEXT="与列表页构型名称一致" ID="a8ca9a1a93f8156bb8adabd55c59e42b" STYLE="fork"/>
                  </node>
                  <node TEXT="型号" ID="4914ea10c41cff1dbd441414cf762d3f" STYLE="fork">
                    <node TEXT="与列表页型号一致" ID="aa8aa7a3a4a6d3db1c466882d298a9a4" STYLE="fork"/>
                  </node>
                  <node TEXT="描述" ID="183c19faeaaf7ccdf53d61ba2bbf9159" STYLE="fork">
                    <node TEXT="与列表页描述一致" ID="823a7802795c484836b0250f847dc4ff" STYLE="fork"/>
                  </node>
                  <node TEXT="配置文件" ID="f67d7918e2d1855006c310368676b391" STYLE="fork">
                    <node TEXT="与列表页配置文件一致" ID="f3dd2bc77d736b79934ea4c9f95903f9" STYLE="fork"/>
                  </node>
                  <node TEXT="已绑定设备" ID="e470a2e817d63ec64d3a72fa75ed8f16" STYLE="fork">
                    <node TEXT="显示具体的机器人编号" ID="f5c664f2a04c6c9eef4c8b6b1a2721b9" STYLE="fork"/>
                    <node TEXT="数量与列表页数量一致" ID="73adbaed19c183df9fa42c510790b541" STYLE="fork"/>
                  </node>
                  <node TEXT="创建时间" ID="274d0496c6c36752086b7a5e69f0a038" STYLE="fork">
                    <node TEXT="与列表页创建时间一致" ID="1fb0f5b1d4734dc4db895543bb226f86" STYLE="fork"/>
                  </node>
                  <node TEXT="绑定设备" ID="cb739aba81b841f00e9e05fb2ea22f32" STYLE="fork">
                    <node TEXT="展示所有该构型绑定的设备（机器人编号）" ID="8d9b80a380c61cb7e565fe031d742f09" STYLE="fork">
                      <node TEXT="展示：设备名称 · 状态 · 心跳" ID="9891ee728ecd012a736902de9bf5a7db" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
              <node TEXT="【修改】" ID="c313a455de6b19183f22eabd19dfdc0d" STYLE="fork">
                <node TEXT="都可以进行修改，背后原始的ID不变" ID="b318144af90d40cac8627a1ec5bcc16c" STYLE="fork"/>
              </node>
              <node TEXT="【删除】" ID="f2bf7fead88f91726634ceec79af3e48" STYLE="fork">
                <node TEXT="校验" ID="0a7a9e59a577549093e8e77ddc2a0a2a" STYLE="fork">
                  <node TEXT="构型被绑定时，不允许删除" ID="f4d35492a43be5bfb15efa9d98955e1a" STYLE="fork"/>
                </node>
                <node TEXT="二次确认后删除该构型" ID="b7af940fb6774a86c4ad7df36f3241c5" STYLE="fork"/>
              </node>
            </node>
            <node TEXT="排序：按照创建时间倒序" ID="0908620aa987b7cbfc36be9b1af3777f" STYLE="fork"/>
          </node>
        </node>
      </node>
      <node TEXT="账号与权限（封伟）" ID="823972b10dd8cc6614abe0fb54d5ce63" STYLE="fork">
        <node TEXT="用户tab" ID="6f818449e03f3831171a73f83a23f1cc" STYLE="fork">
          <node TEXT="筛选项" ID="893fc8dabffd8ee507ecb0fb2e3f317f" STYLE="fork">
            <node TEXT="搜索用户名/姓名" ID="9a6f2699aaed12dd6ee322468dc71eb8" STYLE="fork">
              <node TEXT="模糊查询" ID="20a0d483927ad4fdbb06c9f7c5d38085" STYLE="fork"/>
            </node>
            <node TEXT="【查询】" ID="f5b1841e69c8b0e5b52861d88ce01e45" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="6fbfd2361d32beb1e94554ea420732a3" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="4762a4b45f96fe2d60ef9abba98de979" STYLE="fork">
              <node TEXT="重置为空，查询所有" ID="07e610886b4bb36e840b400dbe17272d" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="【新增用户】" ID="ebd1d768c728602d5e716ba090e27a37" STYLE="fork">
            <node TEXT="点击弹出“新增用户”弹框" ID="bdae4e0e1d88adec3dfede7515b38f4a" STYLE="fork">
              <node TEXT="* 用户名" ID="3516e27c5e191bf88ffe031c5bc394ce" STYLE="fork">
                <node TEXT="必填项" ID="0e679241f5db6bfc5516decb3c8d74c9" STYLE="fork"/>
                <node TEXT="仅支持英文字母、数字" ID="0d7ce10b9a2eef6d35ac21ac24e5834f" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="93b8926fe285cc96a1e5a59dcdacb318" STYLE="fork"/>
              </node>
              <node TEXT="* 姓名" ID="7c7048a5d86dd48e19db2a94fdd57096" STYLE="fork">
                <node TEXT="必填项" ID="594c3e576f2c3dba34bc697af66ef59f" STYLE="fork"/>
                <node TEXT="仅支持中英文字母、数字" ID="79d8b4a1314009d94aa8d6f8de5c89af" STYLE="fork"/>
                <node TEXT="输入限制&lt;=16" ID="445247e45167de7a52f8e8d8ec14e39e" STYLE="fork"/>
              </node>
              <node TEXT="* 角色" ID="d89a84f4fc953ee4164d49233287970e" STYLE="fork">
                <node TEXT="必选项，单选" ID="40a0af8c31228d5885eb1481d22a0910" STYLE="fork"/>
                <node TEXT="下拉数据来源：角色tab中所有的角色名称" ID="2ebb55dbb982c6160fd41b007f196a4c" STYLE="fork"/>
              </node>
              <node TEXT="状态" ID="e7493a6a524a5e54cc277394951e6776" STYLE="fork">
                <node TEXT="启用" ID="b14b59ca9bddd041bc419107a812d634" STYLE="fork">
                  <node TEXT="默认选中" ID="3886f5c6ea369c1530553b26fe068af9" STYLE="fork"/>
                </node>
                <node TEXT="禁用" ID="040acb22b6da52b7c827cd2aa25cbbb3" STYLE="fork"/>
              </node>
              <node TEXT="【取消】" ID="819e5b76b6b9e5f4e65563d26913ad39" STYLE="fork">
                <node TEXT="不保存，关闭弹框" ID="e6c28fd021931edb35198485c9b669b4" STYLE="fork"/>
              </node>
              <node TEXT="【保存】" ID="2dc8cb1c91018611a9806bef8cc05d07" STYLE="fork">
                <node TEXT="校验" ID="1042be761937e0ecd8bdc2f97c2320e0" STYLE="fork">
                  <node TEXT="用户名不允许重复" ID="ee771c403be62a3447e16a30aa92954b" STYLE="fork">
                    <node TEXT="幂等校验" ID="fddb4905f4e15d6fad1985a449f8847f" STYLE="fork"/>
                  </node>
                  <node TEXT="姓名不允许重复" ID="77438d5c62a4a714d81201c46d1f3fda" STYLE="fork">
                    <node TEXT="幂等校验" ID="d47b6cf4718baf195b9b8afee669ab05" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="保存成功后，列表页显示刚新增的用户数据" ID="7b39488ec4b11e8024004610a32eb596" STYLE="fork">
                  <node TEXT="密码默认为：123456" ID="ffd47847301bc35a10797b994b912d9f" STYLE="fork">
                    <node TEXT="用户登录后可自行修改密码" ID="e8c23b09da84b1071c57a45f27d36c9b" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
          </node>
          <node TEXT="列表页" ID="5ef26f54b2dac30b2dcb8537fa75a87c" STYLE="fork">
            <node TEXT="用户名" ID="9d9380647998a10bbc62988a23c65e33" STYLE="fork">
              <node TEXT="与新增用户时，填写的一致" ID="2fe5dc00b581e2d470248ead0e27607f" STYLE="fork"/>
            </node>
            <node TEXT="姓名" ID="dbee38983c6c5ffc3890608ed1e598b1" STYLE="fork">
              <node TEXT="与新增用户时，填写的一致" ID="5f24bd9c80fd09236ef66c09228709ad" STYLE="fork"/>
            </node>
            <node TEXT="角色" ID="ec0f0b6f344cd8aeaae8b3fac6791ad6" STYLE="fork">
              <node TEXT="与新增用户时，选择的一致" ID="3bfc0273104fac697edd948387141655" STYLE="fork"/>
            </node>
            <node TEXT="状态" ID="c9c8103b1c0114467df6165da1d06e97" STYLE="fork">
              <node TEXT="启用" ID="cbf46abd5529dcc0d6bdaf84a66b74f4" STYLE="fork"/>
              <node TEXT="禁用" ID="fd45594dd59d82ad40f881dac2405b26" STYLE="fork"/>
            </node>
            <node TEXT="创建时间" ID="6d9dc75c425a73a4b716a026205494c4" STYLE="fork">
              <node TEXT="展示：年-月-日  时:分" ID="e37e58a075bf93d65ba81f4107835812" STYLE="fork"/>
            </node>
            <node TEXT="操作" ID="ef784973934849d54930acdeea8f4128" STYLE="fork">
              <node TEXT="【编辑】" ID="b69e08ac51e186903a235ce94b386c7b" STYLE="fork">
                <node TEXT="用户名置灰不允许修改" ID="9b2c0271792c6c2e5db238a1629ff55a" STYLE="fork"/>
                <node TEXT="姓名、角色、状态可进行修改" ID="f7c27a7f388113fa7b06e4498bfe2e20" STYLE="fork"/>
              </node>
              <node TEXT="【重置密码】" ID="44433afe39ed61857888b0d5902764f8" STYLE="fork">
                <node TEXT="重置为123456" ID="5f12cdbdf0b4a4eff11fe63aa5ec26c5" STYLE="fork"/>
              </node>
              <node TEXT="【禁用】/【启用】" ID="edfd4215dbef581e0cacab17d9e1173c" STYLE="fork">
                <node TEXT="【禁用】点击后用户状态变更为禁用" ID="158299fa1e86b8c0b25bfb1d6f6a0f63" STYLE="fork">
                  <node TEXT="页面显示禁用成功的弱提示" ID="c50dfb33ff96494d3e10f0d6da655e00" STYLE="fork"/>
                  <node TEXT="平台侧" ID="a02e420e214c25fcc756a4944f5c714e" STYLE="fork">
                    <node TEXT="登录功能" ID="b900828feb138172ea0e75a84d426614" STYLE="fork">
                      <node TEXT="未登录" ID="f4c853689af0b818da9d00c00edf036a" STYLE="fork">
                        <node TEXT="该用户无法进行登录" ID="af92de380d842db3afb03095b84ecf84" STYLE="fork">
                          <node TEXT="提示：“用户不存在或已被禁用”" ID="d4cdbbeeef9672b26b424dc2e72652f6" STYLE="fork"/>
                        </node>
                      </node>
                      <node TEXT="已登录" ID="5ea4102292ad59cfb722867aa2c99345" STYLE="fork">
                        <node TEXT="调接口后，会被强制登出" ID="0448c416615f84f4eca78b68b57fc78c" STYLE="fork"/>
                      </node>
                    </node>
                    <node TEXT="任务下发功能（采集人员）" ID="fea0acbb6860d0deb286e3cb4ddd7197" STYLE="fork">
                      <node TEXT="采集人员下拉中不展示已禁用的采集人员" ID="22b411e7119781cff561b1dfc8ed6487" STYLE="fork">
                        <node TEXT="之前已选择的不受影响" ID="015a11825f132c260b85fc74322b5869" STYLE="fork"/>
                      </node>
                    </node>
                  </node>
                  <node TEXT="端侧" ID="256cb32c75216a96cefd95381e1d88d2" STYLE="fork">
                    <node TEXT="无影响，端侧无登录" ID="2df1862ac423509dc8370fb571301edf" STYLE="fork"/>
                  </node>
                </node>
                <node TEXT="【启用】点击后用户状态变更为启用" ID="0032a3e6159c31ea4cb011b4b38a8f7d" STYLE="fork">
                  <node TEXT="页面显示启用成功的弱提示" ID="1ec1a5d054078c615a4a58fec2fa3847" STYLE="fork"/>
                </node>
              </node>
            </node>
            <node TEXT="默认用户" ID="c033a2685a70746e8621393f7779116a" STYLE="fork">
              <node TEXT="用户名：admin" ID="6dd2378543ec907e1ba15642c1a4239f" STYLE="fork">
                <node TEXT="姓名：超级管理员" ID="50f6d9e546e9fbf9e4a7f135c01fd6d9" STYLE="fork">
                  <node TEXT="角色：管理员" ID="891619d9f63d434c126ff3114531da8d" STYLE="fork">
                    <node TEXT="状态：启用" ID="705f853ab5a2466aa6a74f5967c03f62" STYLE="fork">
                      <node TEXT="有【重置密码】按钮" ID="8df4179885c1fb87dd08d2b917fd4a08" STYLE="fork">
                        <node TEXT="点击重置密码为：123456" ID="63e73b41d1221a1361fbbc82bc8f3317" STYLE="fork"/>
                      </node>
                      <node TEXT="无【编辑】【禁用】按钮" ID="3cbb9df24254a0b484cbeb204d137c91" STYLE="fork"/>
                    </node>
                  </node>
                </node>
              </node>
            </node>
            <node TEXT="排序：按照创建时间倒序" ID="3419218fa647304fb972d1bc0728f124" STYLE="fork"/>
          </node>
          <node TEXT="系统右上角可修改密码" ID="f700ff88bd8f512f9070ef0661cece2b" STYLE="fork">
            <node TEXT="弹出“修改密码”弹框" ID="c4d64ebb747c656536157e036bb0d5e9" STYLE="fork">
              <node TEXT="* 原密码" ID="65322fc84477a4554bd5df8029cb533a" STYLE="fork">
                <node TEXT="必填项" ID="a77e766e7f98d7f7c2c2db0f215c6b2b" STYLE="fork"/>
                <node TEXT="长度&lt;=16" ID="7c0e0848d4605eb56f7e8857957b7d43" STYLE="fork"/>
              </node>
              <node TEXT="* 新密码" ID="c09b4e1bb11a2075da3486e3da3d9bcd" STYLE="fork">
                <node TEXT="必填项" ID="6952ecbdece76708e81c8bcb07b815fd" STYLE="fork"/>
                <node TEXT="长度&lt;=16" ID="9bcea48b999e00955ec958cb4a66780f" STYLE="fork"/>
              </node>
              <node TEXT="* 确认密码" ID="6d25216336a4c18942e8dbe960b3c7ed" STYLE="fork">
                <node TEXT="必填项" ID="a0e0d57cda13d16cd2878b5c65e3d28a" STYLE="fork"/>
                <node TEXT="长度&lt;=16" ID="0362d8663212746ab0d982b893c92a0d" STYLE="fork"/>
              </node>
              <node TEXT="【取消】" ID="35d17ad04c11ef714790c59d2ddb8fb5" STYLE="fork">
                <node TEXT="不保存，关闭弹框" ID="73349fd1acce282c8d381ca9500d21d2" STYLE="fork"/>
              </node>
              <node TEXT="【确认】" ID="664e168f699acb9fb5031d7e46c32a7a" STYLE="fork">
                <node TEXT="校验" ID="49180364789eb2eefe1ed5b1c47043eb" STYLE="fork">
                  <node TEXT="原密码正确" ID="4d4e6ac9613fa179bcc11e97900bc7cf" STYLE="fork"/>
                  <node TEXT="新密码两次输入一致" ID="98cbde4c259dff7743a5dcd717f868b8" STYLE="fork"/>
                </node>
                <node TEXT="修改密码成功后" ID="bfcd9aec426155c188c54baa9dd086e6" STYLE="fork">
                  <node TEXT="保持现有登录状态" ID="5df2c208233c068ac39d9d1709ef4025" STYLE="fork"/>
                  <node TEXT="再次登录输入原密码" ID="78be5ac58dc3fc4bdb70899bab2be57a" STYLE="fork">
                    <node TEXT="提示：“用户名或密码错误”" ID="6604f2f0344a3e1b21d3561a7f3ce624" STYLE="fork"/>
                  </node>
                  <node TEXT="再次登录输入新密码" ID="b82d726af2fd2b30773885d000fd3879" STYLE="fork">
                    <node TEXT="正常登录成功" ID="9aa5c3c4b91957d224671e96bf8baaf0" STYLE="fork"/>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
        <node TEXT="角色tab" ID="dda839ef8f6e636e6b47310a0ba43e55" STYLE="fork">
          <node TEXT="筛选项" ID="3df0241e43751ffbe35215d016f433aa" STYLE="fork">
            <node TEXT="搜索角色名称/编码" ID="f8f05ffbb41e0e0c288e4f21f9e2148c" STYLE="fork">
              <node TEXT="模糊查询" ID="472300efb22e66f1475e5af407044a8d" STYLE="fork"/>
            </node>
            <node TEXT="【查询】" ID="c95325a31613e76d54b8c3d14349f199" STYLE="fork">
              <node TEXT="列表页筛选出符合条件的数据" ID="bcc6378a99fb2a8e8707d863621924bc" STYLE="fork"/>
            </node>
            <node TEXT="【重置】" ID="a5162c6e42d1128024eb35a694a1fdeb" STYLE="fork">
              <node TEXT="重置为空，查询所有" ID="0ccccd0f2438046fc1b641d71d1a53d1" STYLE="fork"/>
            </node>
          </node>
          <node TEXT="列表页" ID="8b4871dcd8daaa0e7de213aa371ba615" STYLE="fork">
            <node TEXT="默认角色" ID="87a0a2032226556111eba46b142b2382" STYLE="fork">
              <node TEXT="admin" ID="95a32a2d2524ac7a1c6471264e9a8f57" STYLE="fork">
                <node TEXT="管理员" ID="525e28b82a8ccebc96171bb29a561b98" STYLE="fork">
                  <node TEXT="可见模块：全部模块" ID="439be6a3afd0435970dc2c1c70ebd159" STYLE="fork">
                    <node TEXT="无【配置权限】按钮" ID="dd9fd02f9f88521b754f0cc5f8ef3f0a" STYLE="fork"/>
                  </node>
                </node>
              </node>
              <node TEXT="engineer" ID="0bf48977696c765dae0df50c283fc9cb" STYLE="fork">
                <node TEXT="工程师" ID="9e71fb584526ea99f2bb20cb8668f648" STYLE="fork">
                  <node TEXT="可见模块：总览、采集任务、数据检查、机器人配置" ID="fdb207b0a40a35caa88eec2c29dbf834" STYLE="fork">
                    <node TEXT="无【配置权限】按钮" ID="d2f3cb0722dee729f314658b85fce453" STYLE="fork"/>
                  </node>
                </node>
              </node>
              <node TEXT="collection_engineer" ID="c828e9351c1b5f4a1ef89eb07024eb59" STYLE="fork">
                <node TEXT="采集员" ID="744160a07840d2f5067d97c38094d08f" STYLE="fork">
                  <node TEXT="可见模块：采集任务" ID="a00289d7763d436bf2fabc54c84a4d95" STYLE="fork">
                    <node TEXT="无【配置权限】按钮" ID="a19af4d171ac0aacbbddb34f1ce4bbb3" STYLE="fork"/>
                    <node TEXT="现场采集角色,可见全部任务(与管理员同范围),但只能筛选、不能做任何操作(任务行与子任务行不显示任何操作按钮,无「创建任务」按钮)" ID="d5b456920bdd7ccb7146758625f9e88a" STYLE="fork">
                      <node TEXT="当前版本写死采集员可以看采集任务，但不展示功能按钮" ID="6bbf1b575027affeef564757763bba00" STYLE="fork"/>
                    </node>
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