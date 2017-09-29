var globalJwt; //定义全局 jwt
function getAuthorization() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var weeknum = now.getDay();
  var hour = now.getHours();
  var min = parseInt(now.getMinutes() / 5);

  var str = year + "-" + Appendzero(month) + "-" + Appendzero(date) + " " + Appendzero(hour) + "" + min;
  var v = 'm.nonobank.com/msapi/' + str;
  var vMd5 = md5(v);
  return vMd5;
}


function Appendzero(obj) {
  if (obj < 10) {
    return "0" + "" + obj;
  } else {
    return obj;
  }
}

function setSession(name, value) {
  try {
    if(typeof value === 'object') {
      value = JSON.stringify(value);
    }
    window.sessionStorage.setItem(name, value);
  } catch (error) {
    Storage.prototype._setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function() {};
    alert('请不要在无痕模式下打开');
  }
}


function getSearch() {
  if (window.location.search == '') {
    return false;
  }
  var query_string = {},
    query = window.location.search.substring(1),
    vars = query.split("&");        

  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}

var HOST = /nonobank.com/.test(location.host) ? location.protocol + "//" + location.host + (location.port ? ":" + location.port : "") : "https://m.stb.nonobank.com";
var PRD_HOST = "https://m.nonobank.com/feserver";


var util = {
  getSearch: getSearch,
  getAuthorization: getAuthorization
};
