# test
https://www.cnblogs.com/xxcanghai/articles/5099187.html
#
https://blog.csdn.net/qiphon3650/article/details/80087987

##
canvas转换为dataURL (从canvas获取dataURL)
var dataurl = canvas.toDataURL('image/png');
var dataurl2 = canvas.toDataURL('image/jpeg', 0.8);
File对象转换为dataURL、Blob对象转换为dataURL
File对象也是一个Blob对象，二者的处理相同。

function readBlobAsDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);};
    a.readAsDataURL(blob);
}
//example:
readBlobAsDataURL(blob, function (dataurl){
    console.log(dataurl);
});
readBlobAsDataURL(file, function (dataurl){
    console.log(dataurl);
});




dataURL转换为Blob对象
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
//test:
var blob = dataURLtoBlob('data:text/plain;base64,YWFhYWFhYQ==');
dataURL图片数据绘制到canvas
先构造Image对象，src为dataURL，图片onload之后绘制到canvas

var img = new Image();
img.onload = function(){
    canvas.drawImage(img);
};
img.src = dataurl;




File,Blob的图片文件数据绘制到canvas
还是先转换成一个url，然后构造Image对象，src为dataURL，图片onload之后绘制到canvas

利用上面的 readBlobAsDataURL 函数，由File,Blob对象得到dataURL格式的url，再参考 dataURL图片数据绘制到canvas

readBlobAsDataURL(file, function (dataurl){
    var img = new Image();
    img.onload = function(){
        canvas.drawImage(img);
    };
    img.src = dataurl;
});




不同的方法用于构造不同类型的url (分别是 dataURL, objectURL(blobURL), filesystemURL)。这里不一一介绍，仅以dataURL为例。

filesystemURL不是指本地文件URL的形式(file:///….), 而是格式类似于 filesystem:http://... 的一种URL，支持沙盒文件系统的浏览器支持(目前仅Chrome)支持。

Canvas转换为Blob对象并使用Ajax发送
转换为Blob对象后，可以使用Ajax上传图像文件。

先从canvas获取dataurl, 再将dataurl转换为Blob对象

var dataurl = canvas.toDataURL('image/png');
var blob = dataURLtoBlob(dataurl);
//使用ajax发送
var fd = new FormData();
fd.append("image", blob, "image.png");
var xhr = new XMLHttpRequest();
xhr.open('POST', '/server', true);
xhr.send(fd);




const convertBase64UrlToBlob = function (urlData, type) {
  var bytes=window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
  //处理异常,将ascii码小于0的转换为大于0
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i);
  }
  return new Blob( [ab] , {type});
}

function convertBase64UrlToBlob(urlData, type) {
  //去掉url的头，并转换为byte     //处理异常,将ascii码小于0的转换为大于0
  var bytes = window.atob(urlData.split(",")[1]);
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/" + type });
}


var offCanvas = document.createElement("canvas"),
        offContext = offCanvas.getContext("2d"),
        w = _self.cutRect.width,
        h = _self.cutRect.height;
      offCanvas.width = w;
      offCanvas.height = h;
      offContext.drawImage(_self.canvas, _self.cutRect.x, _self.cutRect.y, w, h, 0, 0, w, h);
      // _self.ret64 = offCanvas.toDataURL("image/jpeg", _self.quality);
      // _self.ret64 = offCanvas.toBlob("image/jpeg", _self.quality);
      offCanvas.toBlob(function (blob) {
        var newImg = document.createElement("img"),
          url = URL.createObjectURL(blob);

        newImg.onload = function () {
          // no longer need to read the blob so it's revoked
          URL.revokeObjectURL(url);
        };

        console.log(blob, 666);


        newImg.src = url;
        document.body.appendChild(newImg);
      });
