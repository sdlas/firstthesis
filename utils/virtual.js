  function real(e){//取实部
    var p = e.split("+")
    return parseFloat(p[0])
  }
  function virtual(e){//取虚部
    var p = e.split("+")
    return parseFloat(p[1])
  }
  function plus(e1,e2){//相加
    var that = this
    var a = that.real(e1)
    var b = that.virtual(e1)
    var c = that.real(e2)
    var d = that.virtual(e2)
    var r1 =a+c
    var r2 = b+d
    return r1+"+"+r2
  }
  function minus(e1,e2){//相减
    var that = this
    var a = that.real(e1)
    var b = that.virtual(e1)
    var c = that.real(e2)
    var d = that.virtual(e2)
    var r1 = a - c
    var r2 = b - d
    return r1 + "+" + r2
  }
  function times(e1,e2){//相乘
    var that = this
    var a = that.real(e1)
    var b = that.virtual(e1)
    var c = that.real(e2)
    var d = that.virtual(e2)
    var r1 = a*c-b*d
    var r2 = a*d+b*c
    return r1 + "+" + r2
  }
  function devide(e1,e2){//相除
    var that = this
    var a = that.real(e1)
    var b = that.virtual(e1)
    var c = that.real(e2)
    var d = that.virtual(e2)
    var temp =c*c+d*d
    var r1 = (a*c+b*d)/temp
    var r2 = (b*c-a*d)/temp
    return r1 + "+" + r2
  }
  function revise(e){//倒数
    var that = this
    var a = that.real(e)
    var b = that.virtual(e)
    var temp = a*a+b*b
    var r1 = a/temp
    var r2 = -b/temp
    return r1+"+"+r2
  }
  function opposite(e){//相反数
    var that = this
    var a = -that.real(e)
    var b = -that.virtual(e)
    return a+"+"+b
  }
  function size(e){//求模值
    var that = this
    var a = that.real(e)
    var b = that.virtual(e)
    return Math.sqrt(a*a+b*b)
  }
  function iszero(e){//判断是否为0
    var that = this
    var a = -that.real(e)
    var b = -that.virtual(e)
    if(a==0&&b==0) return 1
    else return 0
  }
  function deg(e){//求幅角
    var that = this
    var a = that.real(e)
    var b = that.virtual(e)
    if(a==0){
      if(b>0) return 90
      if(b<0) return -90
      else return 0
    }
    var result = Math.abs(Math.atan(b/a)*180/Math.PI)
    return result
  }
  function tofixed(e){
    var that = this
    var a = that.real(e).toFixed(2)
    var b = that.virtual(e).toFixed(2)
    return a+"+"+b
  }

module.exports = {
  real: real,//取实部
  virtual:virtual,//取虚部
  plus:plus,//相加
  minus:minus,//相减
  times:times,//相乘
  devide:devide,//相除
  revise:revise,//求倒数
  opposite:opposite,//求相反数
  size:size,//求模值
  iszero:iszero,//判断是否为零
  deg:deg,//求幅角
  tofixed:tofixed,//保留两位小数
}