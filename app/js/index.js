
  var ua = navigator.userAgent;
  var sessionId = util.getSearch()['sessionId'] || '1';
  var terminal = util.getSearch()['terminal'];
  var clear = util.getSearch()['clear'];
  var amId = util.getSearch()['am_id'] || '0';
  var getBiz = util.getSearch()['biz'] || 'nono'; //运营配置
  var getPosition = util.getSearch()['position'] || '1';  //运营配置

  // var approach = util.getSearch()['approach'] || '';
  // var approach2 = util.getSearch()['approach2'] || '';
  // var approach3 = util.getSearch()['approach3'] || '';
  var shareInitPeople = util.getSearch()['userInitMsg'] || '';//获取镑客大使的手机号码
  var version = util.getSearch()['version'] || '';

  var share_link = window.location.href;
  var isFromApp = false,
      $http = new http();
  if(terminal == 4 || terminal == 5 || window.WebViewJavascriptBridge) {
    isFromApp = true;
  }

  // Bridge.send({userManager_welfare}

  if(clear){
    localStorage.removeItem('jwt');
  }

  // alert(navigator.userAgent);

  var isWeiXin = /micromessenger/.test(ua.toLowerCase());
  var tokenId = localStorage.getItem('tongdun_token');

  var newShare_link = window.location.href.replace('sessionId', 'instead1').replace('terminal','instead2').replace('version','instead3');
  share_link = newShare_link;
  if (isWeiXin) {
    wxShare();
  }


  var share_title = "福利又双叒叕高炸了！不进来看看？";
  var share_desc = "我说发财，你说又！发财，又~发财，又~"; //分享描述
  var share_icon = HOST + '/nono/spring2017/images/logo.jpg';
  

  var toastr = {
    active: false,
    info: function(msg) {
      var _this = this;
      if (_this.active) {
        return;
      }
      _this.active = true;
      toas.toastrInfo = msg;
      setTimeout(function() {
        toas.toastrInfo = '';
        _this.active = false;
      }, 2000);
    }
  };
  var toas = new Vue({
    el:'#toastr',
    data:{
      toastrInfo:''
    }
  });

  var vm = new Vue({
    el: '#index_view',
    data: {
      info:{
        activityTemplate:{},
        recommendWelfare:[],
        advancedWelfare:[]
      },
      indexShow: true,
      pop:{
        isChose: false, //总的蒙层控制
        isOutShare: false,
        loginSwitch:false,
        isLoginIndex: false,
        vcodeLogin: false,
        eyeShow: false,
        isRegister: false,
        agree: true,
        vCode: false,
        btnText: '获取验证码',
        countdown:8,
        isOnCount:false,
        username:'',
        userTelLog:'', //验证码登录的用户手机号
        userTelReg:'', //注册的用户手机号
        userVcode:'',
        userTel:'',  //地址的用户手机号
        pwd:'',
        // inputType: 'password',
      },
      userJwt: '',
      userInfoMobile:undefined, //镑客大使用户手机号
      isFromApp:isFromApp,
      terminal:terminal,
      detailShow: false, //控制详情显示
      toastrInfo: '',
      privacyContent: '',
      showPrivacy: false,
      showPic: false, //图形验证码控制显示
      welfareRule:0, // 整个活动可领取次数  0 -- 不可重复领取 1 -- 可重复领取
      pic:{
        code:'',
        imgBase:'',
        uuid:''
      }
    },
    methods:{
      init:function () {


        //获取用户jwt
        if(sessionId){
          $http.get('/common/jwt/'+sessionId).then(function (res) {
            if(res.succeed && res.data){
              vm.userJwt = res.data.jwt;
              setSession('invite-jwt',res.data.jwt);
            }
            //获取首页福利信息
            vm.getIndexInfo();
            getUserInfo();
          });
        }else{
          //获取首页福利信息
          vm.getIndexInfo();
        }
      },
      getIndexInfo: function () {
        var params = {
          position: getPosition,
          bizName: getBiz,
        };
        $http.get('/activity/nono-template/index',{params: params, isJwt: true})
          .then(function (res) {
            var data = res.data;
          if(res.succeed){
            if(data){
              document.title = data.activityTemplate&&data.activityTemplate.activityName;
              vm.info = data;
              vm.welfareRule = data.activityTemplate&&data.activityTemplate.welfareRule;
            }

          }else{
            toastr.info(res.errorMessage);
          }
        }).catch(function () {
          toastr.info('服务器挂鸟~');
        });
      },

      toDetail:function(item){
        if(isFromApp){
          if(!vm.userJwt){
            bridge.send({
              type:'login',
              url: window.location.href
            })
          }else{
            detailVue.init(item);
            vm.indexShow = false;
            detailVue.detailShow = true;

          }
        }else{
          if(!vm.userJwt){
            vm.showPop(); //登录弹窗
          }else{
            detailVue.init(item);
            vm.indexShow = false;
            detailVue.detailShow = true;

          }
        }

      },
      initPop: function () {
        vm.pop.isChose = false;
        vm.pop.isOutShare = false;
        vm.pop.isLoginIndex = false;
        vm.pop.isRegister = false;
        vm.pop.vCode = false;
        vm.pop.loginSwitch = false;
        vm.pop.vcodeLogin = false;
      },
      showPop: function () {
        // vm.initPop();
        vm.pop.isChose = true;
        vm.pop.loginSwitch = true;
        vm.pop.isLoginIndex = true;
      },
      registerBtn: function () {
        vm.pop.isRegister = true;
        vm.pop.isLoginIndex = false;
      },
      backToLoginIndex: function () {
        vm.pop.isRegister = false;
        vm.pop.isLoginIndex = true;
      },
      backToRegister: function () {
        vm.pop.vCode = false;
        vm.pop.isRegister = true;
      },
      hideVcodeLogin: function () {
        vm.pop.vcodeLogin = false;
        vm.pop.isLoginIndex = true;
      },
      changeType: function () {
        vm.pop.eyeShow = !vm.pop.eyeShow;
        var ele = document.getElementById('input-login');
        if(vm.pop.eyeShow){
          ele.setAttribute('type','text');
        }else{
          vm.pop.inputType = 'text';
          ele.setAttribute('type','password');
        }
      },
      share: function () {
        var self = this;
        if(isFromApp){
          if(vm.userJwt){
            var shareData = {
              'share_title': share_title,
              'share_desc': share_desc,
              'share_url': share_link,
              'share_icon': share_icon
            };
            bridge.send({
              type: 'share',
              data: shareData
            });
          }else{
            bridge.send({
              type: 'login',
              url: window.location.href
            });
          }
          return;
        }
        // vm.initPop();
        self.pop.isChose = true;
        self.pop.isOutShare = true;

      },
      showVcodeLogin: function () {
        vm.pop.isLoginIndex = false;
        vm.pop.vcodeLogin = true;
      },
      goPrivacy: function () {
        vm.showPrivacy = true;
          $http.get(PRD_HOST+'/common/agreement/privacy').then(function (res) {
            if(res.succeed){
              vm.privacyContent = res.data.content;
            }else{
              toastr.info(res.errorMessage);
            }
          })

      },
      checkPhone: function () {
        if (!/^1\d{10}/.test(vm.pop.userTelReg)) {
          toastr.info('手机号码格式不正确');
          return;
        }
        var req = /1[345789]\d{9}$/;
        if (!req.test(vm.pop.userTelReg)) {
          toastr.info('手机号不合法');
          return;
        }
        var _this = this;
        $http.get('/common/check/'+'mobile'+'/'+_this.pop.userTelReg).then(function (res) {
          if(res.succeed){
            if(res.data.exists === 1){
              toastr.info(res.errorMessage);
            }else{
              vm.pop.isRegister = false;
              vm.pop.vCode = true;
            }
          }
        });

      },
      getPic: function () {
        $http.get('/common/captcha').then(function (res) {
          if(res.succeed){
            vm.pic.imgBase = res.data.captcha;
            vm.pic.uuid = res.data.uuid;
          }
        });
      },
      checkPic: function () {
        var params ={
          uuid:vm.pic.uuid,
          captcha:vm.pic.code
        };
        $http.get('/common/captcha/verify',{params:params}).then(function (res) {
          if(!res.succeed){
            toastr.info(res.errorMessage);
            vm.getPic();
          }else{
            vm.sendCode();
            vm.showPic = false;
          }
        });
      },

      checkCode: function () {
        if(vm.pop.vcodeLogin){
          if (!/^1\d{10}/.test(vm.pop.userTelLog)) {
            toastr.info('手机号码格式不正确');
            return;
          }
          var req = /1[345789]\d{9}$/;
          if (!req.test(vm.pop.userTelLog)) {
            toastr.info('手机号不合法');
            return;
          }
          vm.sendCode();
          return;
        }
        vm.showPic = true;
        vm.pic.code = '';
        vm.getPic();



      },
      sendCode: function () {
        var params;
        if(vm.pic.uuid){
          params = {
            mobile: vm.pop.vcodeLogin?vm.pop.userTelLog:vm.pop.userTelReg,
            codeType: vm.pop.vcodeLogin?1:0,
            bizCode: 0,
            tokenId: tokenId,
            uuid: vm.pic.uuid,
            captcha: vm.pic.code

          }
        }else{
          params = {
            mobile: vm.pop.vcodeLogin?vm.pop.userTelLog:vm.pop.userTelReg,
            codeType: vm.pop.vcodeLogin?1:0,
            bizCode: 0,
            tokenId: tokenId
          };

        }
        $http.post('/user/v-code',params).then(function (res) {
          if (!res.succeed) {
            toastr.info(res.errorMessage);
            return;
          }
          function startCountDown() {
            // vm.pop.countdown = 8;
            vm.pop.countdown--;
            if (vm.pop.countdown >= 0) {
              vm.pop.isOnCount = true;
              setTimeout(startCountDown, 1000);
            } else {
              vm.pop.isOnCount = false;
              vm.pop.btnText = '重新获取';
              vm.pop.countdown = 8;
            }
          }
          startCountDown();
        });
      },

      completeRegister: function () {
        var params = {
          tokenId: tokenId,
          mobile: vm.pop.userTelReg,
          vcode: vm.pop.userVcode,
          bizCode: 0,
          amId: amId,
          inviteMobile: shareInitPeople
        };
        $http.post('/user/register',params).then(function (res) {
          if(res.succeed){
            setSession('invite-jwt',res.data.jwt);
            vm.userJwt = res.data.jwt;
            vm.getIndexInfo();
            localStorage.setItem('jwt',res.data.refresh);
            vm.initPop();
            var num = share_link.indexOf('userInitMsg');
            share_link = share_link.substring(0,num);
            share_link = share_link + 'userInitMsg='+vm.pop.getTel;//app 外的分享在注册或登录后需要带上当前人的镑客信息

          }else{
            toastr.info(res.errorMessage);
          }
        });
      },
      showMz: function () {

      },
      doLogin: function () {
        var data ;
        if(vm.pop.vcodeLogin){
          data ={
            loginType: 1, //1--验证码登录  2--用户名密码登录
            tokenId: tokenId,
            username: vm.pop.userTelLog,
            vcode:vm.pop.userVcode
          }
        }else{
          data = {
            loginType: 2, //1--验证码登录  2--用户名密码登录
            tokenId: tokenId,
            username: vm.pop.username,
            password: md5(vm.pop.pwd)
          }

        }
        $http.post('/user/login',data).then(function (res) {
          if(res.succeed){
            setSession('invite-jwt',res.data.jwt);
            vm.userJwt = res.data.jwt;
            vm.getIndexInfo(); // 登录成功后刷新首页展示数据
            localStorage.setItem('jwt',res.data.refresh);
            if(vm.pop.vcodeLogin){ //在app外打开时 用户是验证码登录的时候
              var num = share_link.indexOf('userInitMsg');
              share_link = share_link.substring(0,num);
              share_link = share_link + 'userInitMsg='+vm.pop.getTel;//app 外的分享在注册或登录后需要带上当前人的镑客信息
            }else{
              getUserInfo();
            }
            vm.initPop();
            if (isWeiXin) {
              wxShare();
            }
          }else{
            toastr.info(res.errorMessage);
          }
        });

      }
    }

  });

  /*详情页*/
  var detailVue = new Vue({
    el: '#detail_view',
    data: {
      terminal: terminal,
      isFromApp: isFromApp,
      info:{
        status:0,  //领取状态 0--可领取倒计时 1--已领取 2--可领取
        h:0,
        m:0,
        s:0
      },
      data:{},
      pop:{
        isChose:false,
        text: '',
        getSuccess: false, //是否显示两个按钮
        choseAddress: false,
        close: false,
        username: '',
        userTel: '',
        userCity: '',
        province: '',
        city: '',
        userDetail: '',
        provinceCode: '',
        cityCode: '',
        btnSureText: '确定'
      },
      getType: 0,
      detailShow: false,
      welfareId:null
    },
    methods: {
      init: function(item){

        var params = {
          welfareId:item.id
        };
        $http.get('/activity/nono-template/welfare-detail',{params:params,isJwt: true})
          .then(function (res) {
          if(!res.succeed){
            toastr.info(res.errorMessage);
            return;
          }
          // // detailVue.pop.close = false;
          // detailVue.pop.choseAddress = true;
          // return;
          detailVue.getType = item.type;
          detailVue.welfareId = item.id;
          var data = res.data;
          if(data){
            detailVue.data = data;
            if(vm.welfareRule == 0){  //  整个活动不可重复领取
              if(data.redeemNumFullRange == 0){ //全部没有领过
                countDownTime(data.endTime); // 可领取然后倒计时
              }else{
                detailVue.info.status = 1; //已领取
              }
            }else{  //可重复领取
              if(data.redeemNumCurrent == 0){ // 当前没领过
                countDownTime(data.endTime); // 可领取然后倒计时
              }else{
                detailVue.info.status = 1; //已领取
              }
            }
            var time = new Date(data.endTime);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            m = m<10?'0'+m:m;
            d = d<10?'0'+d:d;
            detailVue.data.endTime = y + '年' + m + '月' + d +'日';
            detailVue.data.ps = '领取成功后在诺诺APP-我的福利中可以查看哦';
            if(data.userLevel == 0){
              detailVue.data.limit = '普通会员及以上等级可兑换';
            }else if(data.userLevel == 1){
              detailVue.data.limit = 'Vip1及以上等级可兑换';
            } else if (data.userLevel == 2){
              detailVue.data.limit = 'Vip2及以上等级可兑换';
            }else if(data.userLevel == 3){
              detailVue.data.limit = 'Vip3等级可兑换';
            } else{
              detailVue.data.limit = data.userLevel; //白名单
            }

          }


        }).catch(function () {
          toastr.info('服务器挂鸟~');
        })
      },
      initPop: function () {
        var self = this;
        self.pop.isChose = false;
        self.pop.text =  '';
        self.pop.getSuccess = false;
        self.pop.choseAddress = false;
        self.pop.close = false;
        self.pop.btnSureText ='确定'
      },
      //可领取按钮
      drawSth: function(){
        if(detailVue.getType == 3 ){ //实物
          if(vm.welfareRule==0){ //如果是可领取一次的话 弹框提示 点确认领取再填写收货
            detailVue.pop.isChose = true;
            detailVue.pop.text = '同个活动限领一次！请选择最爱的那款哦~';
            detailVue.pop.getSuccess = false;
            detailVue.pop.btnSureText = '确认领取';
          }else{
            detailVue.pop.choseAddress = true;
            getDefaultAddress();
          }

        }else{ // 其他福利则直接调取接口兑换
          detailVue.submitConversion();
        }

      },

      submitConversion: function () {
        $http.post('/activity/nono-template/conversion',{
          welfareId: detailVue.welfareId || '1'
        },{isJwt: true}
        ).then(function (res) {
          var code = res.errorCode;

          if(code == '7010301' || code == '7010302' || code == '7010304'){
            detailVue.pop.isChose = true;
            detailVue.pop.text = '暂不满足领取条件，请继续加油哦';
            return;
          }else if(code == '7010303'){
            detailVue.pop.isChose = true;
            detailVue.pop.text = '该福利已被领完抢光！试试别的吧~';
            return;
          }else if(code == '7010305'){
            detailVue.pop.isChose = true;
            detailVue.pop.text = '每人限领一次哦';
            return;
          }
          if(!res.succeed){
            detailVue.pop.isChose = true;
            detailVue.pop.text = '领取失败，请稍后再试';
            return;
          }

          // 弹出成功提示
          detailVue.pop.getSuccess = true; //显示并排btn
          detailVue.pop.isChose = true;
          detailVue.pop.text = '恭喜您领取成功！请注意查收！';
        }).catch(function () {
          detailVue.pop.isChose = true;
          detailVue.pop.getSuccess = false; //显示并排btn
          detailVue.pop.text = '领取失败，请稍后再试';
        });

      },
      showIndex: function () {
        vm.indexShow = true;
        detailVue.detailShow = false;

      },
      closeModel: function (argument) {
        detailVue.pop.choseAddress = false;
        detailVue.pop.close = true;
      },

      showAddressPicker: function () {
        window.default.AddressPicker.show({
          btnCancel:function(provice,city){
          },
          btnSure:function(provice,city){
            detailVue.pop.userCity = provice.areaName + city.areaName;
            detailVue.pop.province = provice.areaName;
            detailVue.pop.city = city.areaName;
            detailVue.pop.provinceCode = provice.areaCode;
            detailVue.pop.cityCode = city.areaCode;

          }
        });

      },
      subAddress: function () {
        if (!/^1\d{10}/.test(detailVue.pop.userTel)) {
          toastr.info('手机号码格式不正确');
          return;
        }
        var req = /1[345789]\d{9}$/;
        if (!req.test(detailVue.pop.userTel)) {
          toastr.info('手机号不合法');
          return;
        }
        $http.post('/activity/nono-template/update-address',{
          clientType: 2,
          deliveryName: detailVue.pop.username,
          deliveryMobile: detailVue.pop.userTel,
          deliveryProvince: detailVue.pop.provinceCode,
          deliveryCity: detailVue.pop.cityCode,
          deliveryDetail: detailVue.pop.userDetail
        }, {
          isJwt: true
        }).then(function (res) {
          if(!res.succeed){
            toastr.info(res.errorMessage);
          }else{
            detailVue.submitConversion(); //提交完信息开始兑换
            detailVue.closeModel();

          }
        });
      },

      btnSure: function () {
        if(!detailVue.pop.getSuccess){ //单个按钮的情况
          if(detailVue.getType == 3){ // 可领取实物的弹窗
            detailVue.pop.choseAddress = true;
            // 请求用户的默认地址
            getDefaultAddress();
          }else { //确定
            detailVue.initPop();
          }

        }else{ // 继续投资跳转
          if(isFromApp){
            detailVue.initPop();
            bridge.send({
              type:'backToApp'
            })
          }

        }
      },
      checkFuLi: function () {
        var type = detailVue.getType == 3?6:5;  //实物->6 虚拟卡券->5
        bridge.openNativePage({
          target:'userManager',
          action: 'welfare',
          search:{
            selectedIndex: type
          }

        })
      }
    }
  });

  vm.init();

  //请求用户默认地址
  function getDefaultAddress() {
    $http.get('/activity/nono-template/shipping-address',{isJwt:true}).then(function (res) {
      if(res.succeed && res.data){
        var data = res.data;
        detailVue.pop.userCity = data.province&&data.province.name + data.city&&data.city.name;
        detailVue.pop.provinceCode = data.province&&data.province.code;
        detailVue.pop.cityCode = data.city&&data.city.code;
        detailVue.pop.username = data.deliveryName;
        detailVue.pop.userTel = data.deliveryMobile;
        detailVue.pop.userDetaile = data.deliveryDetail;
      }else{
        toastr.info(res.errorMessage);
      }
    });
 }

  //获取用户基本信息
  function getUserInfo() {
    $http.get('/user/info',{isJwt:true}).then(function (res) {
      if(res.succeed && res.data){
        var data = res.data;
        vm.userInfoMobile = data.mobile;

        var num = share_link.indexOf('userInitMsg');
        if(num > 0){ //在app外打开且用户是 用户名密码登录的时候
          share_link = share_link.substring(0,num) + 'userInitMsg='+vm.userInfoMobile;
        }else{ //在app内用户登录后
          share_link = share_link + '&userInitMsg='+vm.userInfoMobile;//分享带上分享人的信息

        }

      }
    });

  }

  function countDownTime(end) {
    // var end = '2017-09-04 16:18:00';
    console.log(end);

    var endTime = new Date(end).getTime();
    console.log(endTime);
    function cutDown(){
      var nowTime = new Date().getTime();
      var t = endTime - nowTime;
      console.log(t);
      if (t>0) {
        var dd = Math.floor(t/1000/60/60/24);
        var hh = Math.floor(t/1000/60/60%24);
        var mm = Math.floor(t/1000/60%60);
        var ss = Math.floor(t/1000%60);
        if(dd > 0){
          hh = dd*24 + hh;
        }
        detailVue.info.h = hh<10?("0" + hh):hh;   //时
        detailVue.info.m = mm<10?("0" + mm):mm;   //分
        detailVue.info.s = ss<10?("0" + ss):ss;   //秒
        detailVue.info.status = 0;
      }else{
        detailVue.info.status = 2; // 可领取
        clearInterval(f);
      }
    }
    cutDown();
    var f = setInterval(cutDown,1000);
  }

   function refreshJwt (JwtRefresh){
    $http.get('/common/refresh-jwt/'+JwtRefresh).then(function (res) {
      if(res.succeed){
        setSession('invite-jwt',res.data.jwt);
        vm.userJwt = res.data.jwt;
      }
      vm.getIndexInfo();

      //如果不在app内并且有缓存的话就去请求初始化的数据
      if(getJwt){

      }
    });

  }
  var getJwt = localStorage.getItem('jwt');
  if(getJwt !== null && !isFromApp){
    refreshJwt(getJwt);
  }


  function wxShare() {
    var href = window.location.href;
    $http.post('/wechat/signature',{
      url: href,
      type: /m.nonobank.com/.test(HOST) ? 'nonobank' : 'congcong'
    }).then(function (res) {
      if (res.errcode) {
        return;
      }

      wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: res.appId, // 必填，公众号的唯一标识
        timestamp: res.timestamp, // 必填，生成签名的时间戳
        nonceStr: res.nonceStr, // 必填，生成签名的随机串
        signature: res.signature, // 必填，签名
        jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });
      wx.error(function(res) {
      });

      wx.ready(function() {
        // alert(share_link);
        //朋友圈
        wx.onMenuShareTimeline({
          title: share_title, // 分享标题
          desc: share_desc, // 分享描述
          link: share_link, // 分享链接
          imgUrl: share_icon, // 分享图标
          success: function() {

            // 用户确认分享后执行的回调函数
            // shareSuccess();
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        //好友
        wx.onMenuShareAppMessage({
          title: share_title, // 分享标题
          desc: share_desc, // 分享描述
          link: share_link, // 分享链接
          imgUrl: share_icon, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function() {
            // alert(share_link)// 用户确认分享后执行的回调函数
            // shareSuccess();
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });
        //QQ
        wx.onMenuShareQQ({
          title: share_title, // 分享标题
          desc: share_desc, // 分享描述
          link: share_link, // 分享链接
          imgUrl: share_icon, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function() {
            // alert(1)// 用户确认分享后执行的回调函数
          },
          cancel: function() {
          }
        });
        //空间
        wx.onMenuShareQZone({
          title: share_title, // 分享标题
          desc: share_desc, // 分享描述
          link: share_link, // 分享链接
          imgUrl: share_icon, // 分享图标
          type: '', // 分享类型,music、video或link，不填默认为link
          dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
          success: function() {
            // alert(1)// 用户确认分享后执行的回调函数
          },
          cancel: function() {
            // 用户取消分享后执行的回调函数
          }
        });

      });
    });
  }


