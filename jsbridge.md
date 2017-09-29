### JsBridge



#### 分享

~~~~javascript
bridge.send({
  type: 'share',
  data: {
    'share_title': share_title,
    'share_desc': share_desc,
    'share_url': share_link,
    'share_icon': share_icon,
  }
});
~~~~

#### 登录

~~~~javascript
bridge.send({
  type: 'login',
  url: window.location.href
});
~~~~

#### 产品详情

~~~~javascript
bridge.send({
  type: 'productDetail',
  data: {
    fp_id: product['fp_id'],
    fp_title: product['fp_title'],
    fp_type: type
  }
});
~~~~

#### 商城－券码兑换详情

~~~~javascript
bridge.send({
  type: 'mallDetail',
  data: {
    cb_id: id
  }
});
~~~~

#### 会员商城－首页

~~~~javascript
bridge.send({
  type: 'pageSwitch',
  data: {
    name: name,
  }
});
~~~~

#### 活动

~~~~javascript
bridge.send({
  type: 'activity',
  data: {
    name: '', //活动具体名字
    link: '', //活动页面url
    needLogin: false //是否需要登录 true:需要, false:不需要
  }
});
~~~~