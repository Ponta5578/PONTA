// LINE developersのメッセージ送受信設定に記載のアクセストークン
var LINE_TOKEN = 'Tg4d2DQmNGMOkTCTOrhndbIaGhmGAVN2gLraOGnhW+eWjgm+6sYNitYUD285dlk5WiVkL90p5+clnH/uIm9OIqwmlrO1Hubqp/qomywEm/IIqGtkAdquq4wJ0ERvAeYTRgwwjSkMbnah3mTkXtp+cgdB04t89/1O/w1cDnyilFU=';
var LINE_URL = 'https://api.line.me/v2/bot/message/reply';
 
//ぐるなび web Service のアクセスキー
var GURUNAVI_TOKEN = '65a2d5a926ff4814f33710a482b18588';
var GURUNAVI_URL = 'https://api.gnavi.co.jp/RestSearchAPI/v3/?';
 
//postリクエストを受取ったときに発火する関数
function doPost(e) {
 
  // 応答用Tokenを取得
  var replyToken = JSON.parse(e.postData.contents).events[0].replyToken;
  // メッセージを取得
  var userMessage = JSON.parse(e.postData.contents).events[0].message.text;
 
  //メッセージを改行ごと（コマンド、アドレス、予算）に分割
  var command = userMessage.split("\n");
  var tag = command[0]; //コマンド取得
  
  // 呟かれた内容がbot宛てでない場合はなにもしない。
  if(!tag == "？飯") return null;
  
  var address = command[1]; //住所取得
  var budget =  command[2]; //予算取得
  
  //ぐるなびに問合せて店情報を取得
  var shops = getShopData(address, budget);
  
  //返答用メッセージを作成
  var messages = [
    {
    'type': 'text',
    'text':  "こんなお店はどうですか？",
    }
  ]
  
  /* //なんかうまくいかない
  shops.forEach(function(shop){
    var meg = {
      'type': 'text',
      'text': shop.url,    
    }
    messages.push(meg);
  });
  */
  
  var meg1 = {
    'type': 'text',
    'text': shops[0].url,    
  }
  messages.push(meg1);
 
  var meg2 = {
    'type': 'text',
    'text': shops[1].url,    
  }
  messages.push(meg2);
 
  var meg3 = {
    'type': 'text',
    'text': shops[2].url,    
  }
  messages.push(meg3);
  
  //lineで返答する
  UrlFetchApp.fetch(LINE_URL, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages,
    }),
    });
  
  ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
 
 
 
}
 
//ぐるなび問合せ
function getShopData(address, budget){
    
  // リクエストパラメーター
  var param = {
    "keyid" : GURUNAVI_TOKEN,
    "address" : address,
    "hit_per_page":100
  }
  
  //パラメータを文字列に変換
  var pramStr = Object.keys(param).map(function(key){ return key+"="+param[key]}).join("&")
 
  //ぐるなびに送信
  var url = GURUNAVI_URL+pramStr;
  var response = UrlFetchApp.fetch(url);
  var content = response.getContentText("UTF-8");  
  var resJson = JSON.parse(content)
  
  //予算でフィルタリング
  var filtered = (budget) ? resJson.rest.filter(function(item){ return item.budget <= budget}) : resJson.rest;
    
  //ランダムに店をセレクト
  var randomize = goodShuffle(filtered);
  var selectShop = randomize.slice(0, 5);
  
return selectShop.map(function(d){ return {name:d.name, url:d.url} });
  
}
 
var goodShuffle = function (arr) {
  var i, j, temp;
  arr = arr.slice();
  i = arr.length;
  if (i === 0) {
    return arr;
  }
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
};