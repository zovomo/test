<template>
  <div class="main-wrapper">
    <div class="row-wrap">
      <div class="wbs-container">
        <ul>
          <li><div class="avatar">
            <img src="../../images/light-weibo.png"/></div>
            <p>深圳公安</p>
            <i class="el-icon-circle-check i-checked"></i>
          </li>
          <li></li>
          <li></li>
        </ul>
        <div class="prev-btn"><i class="el-icon-arrow-left"></i></div>
        <div class="next-btn"><i class="el-icon-arrow-right"></i></div>
      </div>
    </div>
    <div class="row-wrap row-middle">
      <div class="editor-container">
        <div id="weibo-editor">
          <p></p>
        </div>
      </div>
      <div class="upload-container">
        <i v-show="cutImgSrc !== ''" class="el-icon-circle-close i-wb-close"  @click="delWbImg"></i>
        <img v-show="cutImgSrc !== ''" class="cut-img-preview" :src="cutImgSrc" alt="">
        <p>选择需要发布的图片</p>
        <div class="upload-btn">
          <input type="file" id="weibo_img" name="weiboimg" class="weiboimg" value="">
        </div>
      </div>
    </div>
    <div class="weibo-operation clear">
      <p class="weibo-attention">
        注：暂只支持编辑140字以内的文字微博
        <span v-show="editorHtml !== '' && editorHtml.length < 140" class="i-input-tips">仍可输入  {{ 140 - editorHtml.length }}  个字</span>
        <span v-show="editorHtml.length > 140" class="i-input-tips i-tips-wrong">已超出  {{ editorHtml.length - 140 }} 个字</span>
      </p>
      <div class="weibo-tag">
        <span>添加标签</span>
        <el-select
          v-model="dynamicTags"
          multiple
          filterable
          allow-create
          placeholder="请选择文章标签">
          <el-option
            v-for="item in options5"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="weibo-btn" v-if="status === '01' || status === '06'">
        <el-button @click="saveWB">保存</el-button>
      </div>
      <div class="weibo-btn" v-else>
        <el-button type="primary" @click="review">发起审核</el-button>
      </div>
    </div>
    <passPopup
      v-if="passPopupShow"
      :data="{}"
      @publish="publish"
      @cancel="passCancel"
      @confrim="passConfrim">
    </passPopup>
  </div>
</template>
<script>
import { fileUpload, getWeiBoToken, saveWeiboNews, imgTextNewsDetail, updateNewsInfo } from '../../Util/baseUrl'
import { resultPost } from '../../Util/getData'
import passPopup from './../../components/passPopup'
import { Loading } from 'element-ui'
export default {
  name: 'wbEditor',
  components: {
    passPopup
  },
  data () {
    return {
      cutImgSrc: '',
      WbAccessDomain: 'http://szgawebtest.chudaokeji.com ',
      tagInput: '',
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      editorHtml: '',
      passPopupShow: false,
      newsId: '',
      status: '',
      options5: [{
        value: '110',
        label: '110'
      }, {
        value: '出入境',
        label: '出入境'
      }, {
        value: '户政',
        label: '户政'
      }, {
        value: '经侦',
        label: '经侦'
      }, {
        value: '治安',
        label: '治安'
      }, {
        value: '刑警',
        label: '刑警'
      }, {
        value: '交警',
        label: '交警'
      }, {
        value: '消防',
        label: '消防'
      }, {
        value: '网警',
        label: '网警'
      }, {
        value: '特警',
        label: '特警'
      }, {
        value: '禁毒',
        label: '禁毒'
      }, {
        value: '公交',
        label: '公交'
      }, {
        value: '机场',
        label: '机场'
      }]
    }
  },
  methods: {
    handleClose (tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm () {
      let inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },

    // 检验数据的合法性
    ischecked: function () {
      if (!this.editorHtml) {
        this.$notify.error({
          message: '文章内容不能为空'
        })
        return false
      } else if (this.editorHtml.replace(/\s/g, '').length > 140) {
        this.$notify.error({
          message: '请输入140以内的文字'
        })
        return false
      } else if (!this.dynamicTags.length) {
        this.$notify.error({
          message: '请输入标签'
        })
        return false
      } else if (this.dynamicTags.length < 2) {
        this.$notify.error({
          message: '标签不能少于2个'
        })
        return false
      }
      return true
    },

    review () {
      if (this.ischecked()) {
        this.passPopupShow = true
      }
    },

    passCancel: function () { // 点击通过弹窗的取消按钮
      this.passPopupShow = false // 隐藏通过弹窗
    },
    passConfrim: function (id) { // 下级审核 确定按钮触发
      let data = {
        newsId: this.newsId,
        labels: this.dynamicTags.join(','),
        content: this.WbAccessDomain + this.editorHtml,
        auditId: id, // 发布时审核人ID为空
        wbtoken: sessionStorage.weiboToken,
        imgUrl: this.cutImgSrc
      }
      resultPost(saveWeiboNews, data).then(obj => {
        if (obj.code === '0000') {
          this.cutImgSrc = ''
          this.$notify({
            message: '操作成功',
            type: 'success'
          })
          this.passPopupShow = false
          this.initWbwrapper()
        } else {
          this.$notify.error({
            message: '操作失败'
          })
          this.passPopupShow = false
        }
      })
    },
    publish: function () { // 发布按钮触发
      let data = {
        newsId: this.newsId,
        labels: this.dynamicTags.join(','),
        content: this.WbAccessDomain + this.editorHtml,
        auditId: '', // 发布时审核人ID为空
        wbtoken: sessionStorage.weiboToken,
        imgUrl: this.cutImgSrc
      }
      // let fd = new FormData()
      // fd.append('newsId', data.newsId)
      // fd.append('labels', data.labels)
      // fd.append('content', this.WbAccessDomain + data.content)
      // fd.append('auditId', data.auditId)
      // fd.append('token', sessionStorage.weiboToken)
      // fd.append('imgUrl', this.cutImgSrc)
      resultPost(saveWeiboNews, data).then(obj => {
        if (obj.code === '0000') {
          this.cutImgSrc = ''
          this.$notify({
            message: '操作成功',
            type: 'success'
          })
          this.passPopupShow = false
          this.initWbwrapper()
        } else {
          this.$notify.error({
            message: '操作失败'
          })
          this.passPopupShow = false
        }
      })
    },
    altDraft: function (id) {
      resultPost(imgTextNewsDetail, {newsId: id}).then(obj => {
        if (obj.code === '0000') {
          let newsData = obj.data.newsDetail
          if (newsData.title === '微博' && newsData.content.includes('http://')) {
            newsData.content = newsData.content.substr(newsData.content.indexOf(' ') + 1)
          }
          this.cutImgSrc = newsData.img
          this.editorHtml = newsData.content // 设置文章内容
          this.editor.$txt.text(newsData.content) // 设置文章内容
          this.dynamicTags = newsData.labels.split(',')
          this.newsId = newsData.newsId
          this.status = newsData.status
        }
      })
    },
    // 清空数据
    initWbwrapper: function () {
      this.dynamicTags = [] // 标签
      this.newsId = '' // 文章ID
      this.editorHtml = ''
      this.editor.$txt.html('')
      this.editor.$txt.text('')
    },

    // 编辑器跳过来的审核状态中文章，只有保存操作
    saveWB: function () {
      if (this.ischecked()) {
        let data = {
          title: '微博',
          newsId: this.newsId,
          labels: this.dynamicTags.join(','),
          content: 'http://szgawebtest.chudaokeji.com ' + this.editorHtml
        }
        resultPost(updateNewsInfo, data).then(obj => {
          if (obj.code === '0000') {
            this.$notify({
              message: '操作成功',
              type: 'success'
            })
          } else {
            this.$notify.error({
              message: '操作失败'
            })
          }
        })
      }
    },
    delWbImg: function () {
      this.cutImgSrc = ''
      document.getElementById('weibo_img').value = ''
    }
  },
  mounted () {
    let _this = this
    // 创建编辑器
    let WangEditor = window.wangEditor
    WangEditor.config.printLog = false
    this.editor = new WangEditor('weibo-editor')
    this.editor.config.uploadImgUrl = fileUpload + '?token=' + sessionStorage.getItem('token')
    // 图片上传设置参数
    this.editor.config.uploadParams = {
      token: sessionStorage.getItem('token')
    }
    // 图片上传设置Header
    this.editor.config.uploadHeaders = {
      'Accept': 'multipart/form-data'
    }
    // 上传文件名称
    this.editor.config.uploadImgFileName = 'myFileName'
    // 跨域带cookie
    this.editor.config.withCredentials = false
    // 上传图片超时
    this.editor.uploadImgTimeout = 20000
    let filterMenuItem = ['location', 'fullscreen', 'video', 'img', 'insertcode', 'quote', 'head']
    this.editor.config.menus = WangEditor.config.menus.map(function (item, key) {
      if (filterMenuItem.join('').includes(item)) {
        return null
      }
      return item
    })
    this.editor.create()

    // 监听编辑器内容变化
    this.editor.onchange = function () {
      _this.editorHtml = _this.editor.$txt.text()
    }

    // 编辑来的微博
    if (this.$route.query.newsId) {
      this.newsId = this.$route.query.newsId
      this.altDraft(this.$route.query.newsId)
    }

    resultPost(getWeiBoToken).then(obj => {
      if (obj.code === '0000') {
        sessionStorage.weiboToken = obj.data[0].accessToken
      }
    })

    /* eslint-disable */
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

    const upLoadFile = function (upUrl, file) {
      let fd = new FormData()
      fd.append('token', sessionStorage.weiboToken)
      fd.append('myFileName', file)
      let uploadImgActon = null,
      upintervalFun = null,
      imgSize = file.size / 1024,  // 字节转为 kb
      uploadCurr = 0,  // 当前上传进度
      uploadCurrText = '已上传：0%';  // 当前上传进度文本
      window.$.ajax({
        url: upUrl,
        method: 'post',
        contentType: false,
        processData: false,
        data: fd,
        beforeSend: function () {
          uploadImgActon = Loading.service({ fullscreen: true, text: uploadCurrText})
          upintervalFun = setInterval(function(){
            (uploadCurr < imgSize * 75 / 100) && (uploadCurr += 60);
            (uploadCurr > imgSize * 75 / 100) && (uploadCurr < imgSize * 81 / 100) && (uploadCurr += 5);
            (uploadCurr > imgSize * 81 / 100) && (uploadCurr < imgSize * 85 / 100) && (uploadCurr += 4);
            (uploadCurr > imgSize * 85 / 100) && (uploadCurr < imgSize * 91 / 100) && (uploadCurr += 3);
            (uploadCurr > imgSize * 91 / 100) && (uploadCurr < imgSize * 99 / 100) && (uploadCurr += 2);
            (uploadCurr > imgSize * 99 / 100) && (uploadCurr += 1);
            (uploadCurr > imgSize) && (uploadCurr = imgSize)
            uploadCurrText = `已上传：${(uploadCurr / imgSize * 100).toFixed(2)}%`;
            uploadImgActon.text = uploadCurrText
          }, 100)
        },
        success: function(res){
          _this.cutImgSrc = res
          uploadImgActon.text = `已上传：100.00%`
          setTimeout(function(){
            uploadImgActon.close()
          }, 300)
        },
        error: function(res) {
          uploadImgActon.close()
          alert("图片上传失败")
        },
        complete: function(msg) {
          clearInterval(upintervalFun)
        }
      })
    }

    document.getElementById('weibo_img').onchange = function (e) {
      let file = this.files[0]
      let c = ''
      let canvasPopup = ''
      try {
        canvasPopup = document.getElementsByClassName('canvas-popup')[0]
        canvasPopup.style.display = 'table'
        c = new CanvasClip({
          previewContainer: document.getElementById('canvasContainer'),
          source: file,
          canvasWidth: 800,
          quality: 1
        })
        document.getElementById('submitClip').onclick = function (e) {
          c.clip()
          let upUrl = fileUpload + '?token=' + sessionStorage.getItem('token')
          if (c.ret64) {
            let uploadFile = convertBase64UrlToBlob(c.ret64, 'image/jpeg')
            upLoadFile(upUrl, uploadFile)
          } else {
            let uploadFile = document.getElementById('weibo_img').files[0]
            upLoadFile(upUrl, uploadFile)
          }
          canvasPopup.style.display = 'none'
        }
        document.getElementById('cancelClip').onclick = function (e) {
          canvasPopup.style.display = 'none'
        }
      } catch (error) {
        canvasPopup.style.display = 'none'
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .main-wrapper{
    width: 100%;
    padding: 40px 24px 40px 40px;
    box-sizing: border-box;
    background: #f0f3fb;
    .row-wrap {
      width: 100%;
      .wbs-container {
        position: relative;
        width: 60%;
        height: 138px;
        margin-bottom: 45px;
        background: #FFF;
        .prev-btn,
        .next-btn {
          position: absolute;
          top: 0;
          width: 45px;
          height: 100%;
          line-height: 138px;
          text-align: center;
          background: #d7e0e8;
          i {
            font-size: 24px;
            font-weight: bold;
            font-style: normal;
            color: #FFF;
          }
        }
        .prev-btn {
          left: 0;
        }
        .next-btn {
          right: 0;
        }
        ul {
          padding: 16px 45px 10px;
          height: 100%;
          box-sizing: border-box;

          li {
            width: 80px;
            height: 100%;
            margin-left: 30px;
            display: inline-block;
            vertical-align: top;
            cursor: pointer;
            position: relative;

            .avatar {
              width: 78px;
              height: 78px;
              border-radius: 50%;
              border: 0px solid #ccc;
            }
            p {
              margin-top: 8px;
              font-size: 16px;
              line-height: 1;
              text-align: center;
            }
            .i-checked {
              position: absolute;
              right: 0;
              top: 0;
              font-size: 22px;
              color: green;
            }
          }
        }
      }
      .editor-container,
      .upload-container,
      #weibo-editor {
        height: 500px;
      }
      .editor-container {
        float: left;
        width: 60%;
      }
      .upload-container {
        float: right;
        position: relative;
        width: 38%;
        padding-bottom: 5px;
        background: #FFF;
        border: 1px solid rgba(204, 204, 204, .8);
        p {
          position: absolute;
          top: -24px;
          left: 0;
          width: 100%;
          font-size: 16px;
          line-height: 1;
          color: #000;
          text-indent: 8px;
        }
        .upload-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 180px;
          height: 180px;
          margin-left: -90px;
          margin-top: -90px;
          background: #e3e1e1;
          border-radius: 10px;
          border: 1px solid #ccc;
          &:before,
          &:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            background: #FFF;
          }
          &:before {
            width: 50%;
            height: 8px;
            margin-left: -25%;
            margin-top: -4px;
          }
          &:after {
            width: 8px;
            height: 50%;
            margin-left: -4px;
            margin-top: -25%;
          }
        }
      }
    }
    .row-middle {
      height: 500px;
    }
    .weibo-operation{
      margin-top: 16px;
      .weibo-attention{
        width: 100%;
        height: 36px;
        color: red;
        font-size: 15px;
        line-height: 20px;
      }
    }
    .weibo-tag{
      float: left;
      max-width: 40%;
      height: 36px;
      &>span{
        float: left;
        display: block;
        line-height: 36px;
        color: #0051a3;
        display: inline-block;
        margin-right: 10px;
      }
      .el-select{
        width: 300px;
      }
      .el-input{
        display: inline-block;
        width: 78px;
      }
    }
    .weibo-btn{
      float: right;
      div:not(:last-child){
        margin-right: 16px;
      }
    }
    .btn-stroke,.btn-fill{
      display: inline-block;
      width: 160px;
      height: 40px;
      line-height: 40px;
      border: 2px solid #4d7ec6;
      text-align: center;
      color: #4d80c6;
      cursor: pointer;
    }
    .btn-fill{
      background: #4d7ec6;
      color: #fff;
    }
  }
  .weiboimg{
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 0.0;
    z-index: 2;
    left: 0;
    top: 0;
  }
  .cut-img-preview {
    position: absolute;
    width:80%;
    height: 82%;
    left: 0;
    top: 50%;
    transform: translate(13%, -50%);
    z-index: 1;
  }
  .i-wb-close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 3;
    cursor: pointer;
    color: #e3e1e1;
    font-size: 32px
  }
  .i-input-tips {
    display: inline-block;
    color: blue;
    padding-left: 514px;
  }
  .i-tips-wrong {
    color: red;
  }
</style>
