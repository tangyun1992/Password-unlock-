(function(){
        window.H5lock = function(obj){//得到媒体的大小
            this.height = obj.height;
            this.width = obj.width;
            this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
        };
 H5lock.prototype.init = function() {
            this.initDom();
            this.pswObj = window.localStorage.getItem('passwordxx') ? {
                step: 2,
                spassword: JSON.parse(window.localStorage.getItem('passwordxx'))
            } : {};
            if(this.pswObj.step==2){
                document.getElementById('vertify').checked=true;
            document.getElementById('update').checked=false;
            }
              else{
                 document.getElementById('vertify').checked=false;
            document.getElementById('update').checked=true;
              }
            this.lastPoint = [];
            this.makeState();
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();
            this.bindEvent();
        }
        H5lock.prototype.initDom = function(){
            var wrap = document.createElement('div');
            var str = "<div style='position: absolute;top:0;left:0;right:0;bottom:0;'>"
    +'<canvas id="canvas"  width="300"  height="300";></canvas>'
    +'<h4 id="title" class="title">请输入手势密码</h4>'
   +'<div id="updatePassword" > <input  id="update"  type="radio" value="设置密码" name="password" ><a >设置密码</a>'
       +'</div><br><div id="vertifyPassword" > <input id="vertify" type="radio" value="验证密码" name="password" checked><a id="Password" >验证密码</a></div></div>';
            wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
            wrap.innerHTML = str;
            document.body.appendChild(wrap);
        }
        function getDis(a, b) {//计算两点之间的距离
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        };

        H5lock.prototype.pickPoints = function(fromPt, toPt) {
            var lineLength = getDis(fromPt, toPt);
            var dir = toPt.index > fromPt.index ? 1 : -1;

            var len = this.restPoint.length;
            var i = dir === 1 ? 0 : (len - 1);
            var limit = dir === 1 ? len : -1;

            while (i !== limit) {
                var pt = this.restPoint[i];

                if (getDis(pt, fromPt) + getDis(pt, toPt) === lineLength) {
                    this.drawPoint(pt.x, pt.y);
                    this.lastPoint.push(pt);
                    this.restPoint.splice(i, 1);
                    if (limit > 0) {
                        i--;
                        limit--;
                    }
                }
                i+=dir;
            }
        }

        H5lock.prototype.drawCle = function(x, y) { // 初始化解锁密码面板
            // if(this.touchFlag)  this.ctx.strokeStyle = 'blue';
                 this.ctx.strokeStyle = 'grey';

            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        H5lock.prototype.drawPoint = function() { // 初始化圆心
            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                   this.ctx.lineWidth = 2;
                this.ctx.fillStyle = 'grey';
                // this.ctx.strokeStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r/2 , 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
        H5lock.prototype.drawStatusPoint = function(type) { // 初始化状态线条

            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                 // this.ctx.strokeStyle = 'red';
                   // this.ctx.fillStyle = 'white';
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = type;
                 // if(this.touchFlag)  this.ctx.strokeStyle = 'blue';
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
        H5lock.prototype.drawLine = function(po, lastPoint) {// 解锁轨迹
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
            var temp=lastPoint[0];
            console.log(this.lastPoint.length);
            for (var i = 1 ; i < this.lastPoint.length ; i++) {
                this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
                temp=lastPoint[i];
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        H5lock.prototype.createCircle = function() {// 创建解锁点的坐标，根据canvas的大小来平均分配半径
            var n = this.chooseType;//画出n*n的矩阵
            var count = 0;
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算，半径和canvas打大小有关
            this.lastPoint = [];
            this.arr = [];
            this.restPoint = [];
            var r = this.r;
            for (var i = 0 ; i < n ; i++) {
                for (var j = 0 ; j < n ; j++) {
                    count++;
                    var obj = {
                        x: j * 4 * r + 3 * r,
                        y: i * 4 * r + 3 * r,
                        index: count
                    };
                    this.arr.push(obj);
                    this.restPoint.push(obj);
                    // alert(this.arr.length);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) {
                this.drawCle(this.arr[i].x, this.arr[i].y);
                this.ctx.font=" bold 20pt Arial";
                 this.ctx.fillStyle='rgb(65,65,65)';
                  this.ctx.strokeStyle = 'grey';
                this.ctx.textAlign="center";
                this.ctx.textBaseline="middle";
                this.ctx.fillText(i+1,this.arr[i].x,this.arr[i].y)
            }
            //return arr;
        }
        H5lock.prototype.getPosition = function(e) {// 获取touch点相对于canvas的坐标
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
              };
            return po;
        }
          //接着到了最关键的步骤绘制解锁路径逻辑，通过touchmove事件的不断触发，
        //调用canvas的moveTo方法和lineTo方法来画出折现，同时判断是否达到我们所画的圈圈里面，
        //其中lastPoint保存正确的圈圈路径，restPoint保存全部圈圈去除正确路径之后剩余的。 Update方法：
        H5lock.prototype.update = function(po) {// 核心变换方法在touchmove时候调用
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            this.drawPoint(this.lastPoint);// 每帧花轨迹
            this.drawLine(po , this.lastPoint);// 每帧画圆心

            // for (var i = 0 ; i < this.restPoint.length ; i++) {
            //     var pt = this.restPoint[i];

            //     if (Math.abs(po.x - pt.x) < this.r && Math.abs(po.y - pt.y) < this.r) {
            //         this.drawPoint(pt.x, pt.y);
            //         this.pickPoints(this.lastPoint[this.lastPoint.length - 1], pt);
            //         break;
            //     }
            // }
        }
        H5lock.prototype.checkPass = function(psw1, psw2) {// 检测密码
            var p1 = '',
            p2 = '';
            for (var i = 0 ; i < psw1.length; i++) {
                p1 += psw1[i].index + psw1[i].index;
            }
            for (var i = 0 ; i < psw2.length ; i++) {
                p2 += psw2[i].index + psw2[i].index;
            }
            return p1 === p2;
        }
        H5lock.prototype.storePass = function(psw) {// touchend结束之后对密码和状态的处理
            if(psw.length<=4){ 
                          delete this.pswObj.step;
                           this.drawStatusPoint('red');
                        document.getElementById('title').innerHTML = '密码太短，至少需要5个点';}
             else{
                        if (this.pswObj.step == 1) {
                                if (this.checkPass(this.pswObj.fpassword, psw)) {
                                    this.pswObj.step = 2;
                                    this.pswObj.spassword = psw;
                                    document.getElementById('title').innerHTML = '密码设置成功';
                                      document.getElementById('vertify').checked=true;
                                      document.getElementById('update').checked=false;
                                    this.drawStatusPoint('#2CFF26');
                                    window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                                    window.localStorage.setItem('chooseType', this.chooseType);
                                } else {
                                    document.getElementById('title').innerHTML = '两次密码输入不一致';
                                    this.drawStatusPoint('red');
                                    delete this.pswObj.step;
                                }
                    } else if (this.pswObj.step == 2) {
                        if (this.checkPass(this.pswObj.spassword, psw)) {
                            document.getElementById('title').innerHTML = '密码正确';
                            this.drawStatusPoint('#2CFF26');
                        } else {
                            this.drawStatusPoint('red');
                            document.getElementById('title').innerHTML = '输入的密码不正确';
                        }
                    } else {
                        this.pswObj.step = 1;
                        this.pswObj.fpassword = psw;
                        document.getElementById('title').innerHTML = '再次输入';
                    }
                }
        }
        H5lock.prototype.makeState = function() {
            if (this.pswObj.step == 2) {
                document.getElementById('updatePassword').style.display = 'block';
                //document.getElementById('chooseType').style.display = 'none';
                document.getElementById('title').innerHTML = '请输入手势密码';
            }
        }
        H5lock.prototype.setChooseType = function(type){
            chooseType = type;
            init();
        }
        H5lock.prototype.updatePassword = function(){
            window.localStorage.removeItem('passwordxx');
            window.localStorage.removeItem('chooseType');
            this.pswObj = {};
            document.getElementById('title').innerHTML = '请输入手势密码';
            this.reset();
        }
       
        H5lock.prototype.reset = function() {
            this.makeState();
            this.createCircle();
        }
        H5lock.prototype.bindEvent = function() {//canvas里的圆圈画好之后可以进行事件绑定
            var self = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
                 var po = self.getPosition(e);
                 console.log(po);
                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {// 用来判断起始点是否在圈圈内部
                        self.touchFlag = true;
                        self.drawPoint(self.arr[i].x,self.arr[i].y);
                        self.lastPoint.push(self.arr[i]);
                        self.restPoint.splice(i,1);
                        break;
                    }
                 }
             }, false);
             this.canvas.addEventListener("touchmove", function (e) {
                // if(document.getElementById('updatePassword').checked){self.updatePassword();}
                var temp=self.lastPoint[self.lastPoint.length-1];
                var temp2=self.lastPoint[self.lastPoint.length-2];
                if (self.touchFlag) {
                var po = self.getPosition(e);
                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {// 用来判断起始点是否在圈圈内部
                        if(self.arr[i]!==temp){
                                 if(self.arr[i]!==temp2){
                                 self.drawPoint(self.arr[i].x,self.arr[i].y);
                                self.drawLine(po , self.arr[i].x,self.arr[i].y);
                                self.lastPoint.push(self.arr[i]);
                                // self.restPoint.splice(i,1);
                                break;
                            }
                              else{
                                 // self.drawPoint(self.arr[i].x,self.arr[i].y);
                                // self.drawLine(po , self.arr[i].x,self.arr[i].y);
                                self.ctx.clearRect(self.arr[i].x,self.arr[i].y,self.r,self.r);
                                self.lastPoint.pop();
                                // self.restPoint.splice(i,1);
                                break;
                            }
                        }
                    }

                 }
                 
                    self.update(po);
                }
             }, false);
             this.canvas.addEventListener("touchend", function (e) {
                // if(document.getElementById('updatePassword').checked){self.updatePassword();}
                 if (self.touchFlag) {
                     self.touchFlag = false;
                      // alert(self.lastPoint.length);
                     self.storePass(self.lastPoint);
                     setTimeout(function(){
                        self.reset();
                    }, 300);
                 }
             }, false);
             document.addEventListener('touchmove', function(e){
                e.preventDefault();
             },false);
             document.getElementById('updatePassword').addEventListener('click', function(){
                 self.updatePassword();
              });
             document.getElementById('vertifyPassword').addEventListener('click', function(){
                   document.getElementById('title').innerHTML = '请输入手势密码';
              });
        }
})();
