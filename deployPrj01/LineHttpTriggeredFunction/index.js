//https://github.com/line/line-bot-sdk-nodejs/tree/next/examples/echo-bot
//https://himanago.hatenablog.com/entry/2020/04/23/205202
//strictモード（厳格モード）に設定　エラーチェックが厳しくなるらしい
'use strict';


// @ts-check DB関連の設定
//  <ImportConfiguration>
const CosmosClient = require("@azure/cosmos").CosmosClient;
const configDB = require("./config");
const dbContext = require("./data/databaseContext");
//  </ImportConfiguration>

//ここまでDB関連の設定　tes

//kawa:定数（書き換えられたくない変数）を宣言
//kawa:外部モジュールを読み込む　※const 変数 = require( モジュール名 );　が構文らしい
//kawa:LINE提供の外部モジュールを読み込む　これでLineのAPIを呼び出すことができるようになると思われる
const line = require('@line/bot-sdk');

//kawa:その他いろいろな外部モジュールを読み込み
const createHandler = require("azure-function-express").createHandler;
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { BlobServiceClient } = require("@azure/storage-blob");
const { getStreamData } = require('./helpers/stream.js'); 


const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('files');

// create LINE SDK config from env variables
//kawa: テストしやすいようにアクセストークンとシークレットをハードコーディング（セキュリティ的にはいまいちですが）

//kawa: Aさん用の情報
//kawa:AさんのuserIdを定義
const userId = 'U0af4573ec27255b17b7125f3bfbb5bfe';
const config = {
  //Aさん用のLINEのチャネルアクセストークンとシークレットを↓の""に記入
  //channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelAccessToken: "2s4Y6x+WMWQqDghdIprt2B+Wb8IHQxG6FYVe/EujOKEXXF/3H7U196M6XGWKcit9RQCD+6qTIiyLnaUw3l4QLQXsraqNUiJhNC9OggWlNoLmYm9rhAuukTydl2tOc5idlN6kjr/2u3pBgR/W40nnpgdB04t89/1O/w1cDnyilFU=",
  //channelSecret: process.env.CHANNEL_SECRET,
  channelSecret: "f20da23d0bf6f5dc659d36eec78ac37c",
};

//kawa: Bさん用の情報
//kawa:BさんのuserIdを定義
const userId2 = 'U5e7442aa88d9ad061a14761447955f78';
const config2 = {
  //Bさん用のLINEのチャネルアクセストークンとシークレットを↓の""に記入
  //channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelAccessToken: "Yko44X8qrMuYUTTxy3cBisv3AmDAtsK+HuMriKEuX2U40EOnbHZRY2iWyEp8IY5Rlcjt+Xnz7HFou5waZ5Hq3duS1e9938pM5RMHJQ04jWLBaY3TtBDQCkprW8G3vuEFaLsHKejvPeRHknpETPnFCAdB04t89/1O/w1cDnyilFU=",
  //channelSecret: process.env.CHANNEL_SECRET,
  channelSecret: "46d397205dcc0f1abc9837bc6f939954",
};

// create LINE SDK client
// kawa:Aさん用LINEBOT用LINEオブジェクトを生成
const client = new line.Client(config);

// kawa:Bさん用LINEBOT用LINEオブジェクトを生成
const client2 = new line.Client(config2);


// create Express app
// about Express itself: https://expressjs.com/
// express という外部フレームワークモジュールをロードしてインスタンス化
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/api/linehttptriggeredfunction', line.middleware(config), (req, res) => {
  Promise
  //kawa:handleEvent関数が呼ばれたら結果（result）をjson形式で（LINEに）返却　ってこと？
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
// kawa: async（非同期）型のhandleEvent(event)関数を定義（ここがメインのロジック関数）
async function handleEvent(event) {
  if (event.type !== 'message' && event.type !== 'postback') {
    // ignore non-text-message event
    return Promise.resolve(null);

  } else if (event.type === 'postback') {
    if (event.postback.data === 'sticker') {
      //https://developers.line.biz/ja/reference/messaging-api/#sticker-message
      //https://developers.line.biz/ja/docs/messaging-api/sticker-list/#sticker-definitions
      return client.replyMessage(event.replyToken,{
        type: 'sticker',
        packageId: "11537",
        stickerId: "52002735"
      });
    }


// kawa: 感謝を伝えるボタン押下時のロジック
  } else if (event.message.type === 'text') {
    if (event.message.text === '感謝を伝えます') {


      // kawa: 仮の感謝メッセージ（DBから取得するロジックに変更が必要）
      var pushmessage1 = {
        type: 'text',
        text: '2021/10/13 美味しいご飯を作ってくれてありがとう'
      };

      
      // kawa: Bさんに感謝メッセージをプッシュ
      client2.pushMessage(userId2, pushmessage1)
      .then(() => {
        console.log('push!')
      })
      .catch((err) => {
        // error handling
    　});
      

      // kawa: Aさん用のリプライメッセージを定義
      var returnmessage1 = {
        type: 'text',
        text: '感謝を伝えました'
      };

      // kawa: Aさんにリプライメッセージ
      return client.replyMessage(event.replyToken, returnmessage1);
            

    } else if (event.message.text === 'quick') {
      //https://developers.line.biz/ja/reference/messaging-api/#quick-reply
      return client.replyMessage(event.replyToken,{
        type: 'text',
        text: 'ステッカー欲しいですか❓YesかNoで答えてくださいtest, もしくは素敵な写真送って❗️',
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {
                "type":"postback",
                "label":"Yes",
                "data": "sticker",
                "displayText":"ステッカーください❗️"
              }
            },
            {
              "type": "action",
              "action": {
                "type":"message",
                "label":"No",
                "text":"不要。"
              }
            },
            {
              "type": "action",
              "action": {
                "type": "camera",
                "label": "camera"
              }
            }
          ]
        }
      });
    }

  // kawa: このあたりのロジックを活用すれば画像や音声も取り扱い可能？
  } else if (event.message.type === 'image') {
    //https://developers.line.biz/ja/reference/messaging-api/#image-message
    const blobName = uuidv4() + '.jpg'
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = await client.getMessageContent(event.message.id);
    const data = await getStreamData(stream);
    blockBlobClient.uploadData(data);
    return client.replyMessage(event.replyToken,{
      type: 'image',
      originalContentUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`,
      previewImageUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`
    });
  } else if (event.message.type === 'audio') {
    //https://developers.line.biz/ja/reference/messaging-api/#audio-message
    //durationはこれでとれそう？ > https://www.npmjs.com/package/mp3-duration
    const blobName = uuidv4() + '.mp3'
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const stream = await client.getMessageContent(event.message.id);
    const data = await getStreamData(stream);
    const res = blockBlobClient.uploadData(data);
    return client.replyMessage(event.replyToken,{
      type: 'audio',
      originalContentUrl: `https://${blobServiceClient.accountName}.blob.core.windows.net/files/${blobName}`,
      duration: 60000
    });
  } else if (event.message.type === 'location') {
    //https://developers.line.biz/ja/reference/messaging-api/#location-message
    return client.replyMessage(event.replyToken,{
      type: 'location',
      title: 'my location',
      address: event.message.address,
      latitude: event.message.latitude,
      longitude: event.message.longitude
    });
  }



  // create a echoing text message

  //kawa:感謝メッセージ登録ロジックを↓あたりに入れる


  //kawa:LINEからjson形式で受け取ったデータのうち、text部分をそのまま変数セット
  const echo = { type: 'text', text: event.message.text };
  // const echo2 = { type: 'text', text: event.source.userId };
  const echo2 = { type: 'text', text: 'を登録しましたtest' };




//DBへの接続
  // <CreateClientObjectDatabaseContainer>
  const { endpoint, key, databaseId, containerId } = configDB;

  const clientDB = new CosmosClient({ endpoint, key });

  const database = clientDB.database(databaseId);
  const container = database.container(containerId);

  // Make sure Tasks database is already setup. If not, create it.
  await dbContext.create(clientDB, databaseId, containerId);
  // </CreateClientObjectDatabaseContainer>
  //ここまでDBへの接続

  var min = 1 ;
  var max = 9999999 ;
  
  var ransuu = Math.floor( Math.random() * (max + 1 - min) ) + min ;


  //DBへ登録
  //  <DefineNewItem>
   const newItem = {
    id: "11114",
    category: "test",
    time: "23:00",
    description: "お風呂入れてくれてありがとう",
   };
  //  </DefineNewItem>
    // <CreateItem>
    /** Create new item
     * newItem is defined at the top of this file
     */
     const { resource: createdItem } = await container.items.create(newItem);
    
     // </CreateItem>
     //ここまでDBへの登録

     //DBから取得
    // <QueryItems>
    console.log(`Querying container: Items`);

    // query to return all items
    const querySpec = {
      query: "SELECT * from c"
    };
    
    // read all items in the Items container
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    let getitems = "";
    items.forEach(item => {
      console.log(`${item.id} - ${item.description}`);
      getitems =  getitems+item.description+",";
    });

  // create a echoing text message
   const echo3 = { type: 'text', text: getitems};

　 const getaitemsAry = getitems.split(',')

　 const kansya1 = { type: 'text', text: getaitemsAry[0]};

   const kansya2 = { type: 'text', text: getaitemsAry[1]};

   const kansya3 = { type: 'text', text: getaitemsAry[2]};

   //const kansya4 = { type: 'text', text: getaitemsAry[3]};

   const kansya4 = { type: 'text', text: ransuu};


  // use reply API
  //kawa:登録完了したことを伝える応答メッセージを送る　仕様上受け取った応答トークンをそのままリクエストボディに詰めて返却する必要。
  return client.replyMessage(event.replyToken, [kansya1 , kansya2 , kansya3 , kansya4]);
}

module.exports = createHandler(app);

//https://developers.line.biz/flex-simulator/
const flexMsg = {
  "type": "carousel",
  "contents": [
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_5_carousel.png"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "Arm Chair, White",
            "wrap": true,
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "baseline",
            "contents": [
              {
                "type": "text",
                "text": "$49",
                "wrap": true,
                "weight": "bold",
                "size": "xl",
                "flex": 0
              },
              {
                "type": "text",
                "text": ".99",
                "wrap": true,
                "weight": "bold",
                "size": "sm",
                "flex": 0
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "action": {
              "type": "uri",
              "label": "Add to Cart",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Add to wishlist",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    },
    {
      "type": "bubble",
      "hero": {
        "type": "image",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover",
        "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_6_carousel.png"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "text",
            "text": "Metal Desk Lamp",
            "wrap": true,
            "weight": "bold",
            "size": "xl"
          },
          {
            "type": "box",
            "layout": "baseline",
            "flex": 1,
            "contents": [
              {
                "type": "text",
                "text": "$11",
                "wrap": true,
                "weight": "bold",
                "size": "xl",
                "flex": 0
              },
              {
                "type": "text",
                "text": ".99",
                "wrap": true,
                "weight": "bold",
                "size": "sm",
                "flex": 0
              }
            ]
          },
          {
            "type": "text",
            "text": "Temporarily out of stock",
            "wrap": true,
            "size": "xxs",
            "margin": "md",
            "color": "#ff5551",
            "flex": 0
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "flex": 2,
            "style": "primary",
            "color": "#aaaaaa",
            "action": {
              "type": "uri",
              "label": "Add to Cart",
              "uri": "https://linecorp.com"
            }
          },
          {
            "type": "button",
            "action": {
              "type": "uri",
              "label": "Add to wish list",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    },
    {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "contents": [
          {
            "type": "button",
            "flex": 1,
            "gravity": "center",
            "action": {
              "type": "uri",
              "label": "See more",
              "uri": "https://linecorp.com"
            }
          }
        ]
      }
    }
  ]
}
