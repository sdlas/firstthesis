//index.js
import v from "../../utils/virtual.js"
import m from "../../utils/matrix.js"
//获取应用实例
const app = getApp()
//注意事项:当有电阻串联时，要么将电阻合成一个来算，要么在两个电阻中间再加一个结点,在输入与参考节点相连的电压源时记得自取正负，并且总是以参考节点0为根结点,输入在两节点之间的元件通通默认为并联
//对于电流源nodestart是电流的起始，nodeend是电流的结束
//对于电压源nodeend是电压的高电平，nodestart是电压的低电平
//0是电阻或电容或电感，只需修正参数即可，Ω，1是无伴电压源V，2是无伴电流源A，3是有伴点压源Ω
Page({
  data: {
    w:[],//电源角频率
    Uoc: [],
    Req: [],
    Uitemlist: [],
    Ritemlist: [],
    tab: 0,//小运算的menutab
    littlecalresult: [],//小运算结果
    Null: [],//空，用于置空itemlist从而可以重新计算
    inputid: 0,//判断输入的是哪个单位
    windowHeight: [],
    windowWidth: [],
    badnodeslist: [],//存储中间夹有电压源的结点组
    result: [],//最终结果
    nodenum: 0,//结点数
    currentid: 0,
    showadd: false,//是否显示增加元件的窗口
    showaddk: false,//是否显示受控源
    itemlist:[],
    // itemlist:[
    //   { id: '0', num: '1+0', nodestart: '1', nodeend: '2', whichname: '', shownum: '1' },
    //   { id: '0', num: '0+60', nodestart: '2', nodeend: '3', whichname: 'L', shownum: '1' },
    //   { id: '0', num: '1+0', nodestart: '0', nodeend: '3', whichname: '', shownum: '1' },
    //   { id: '0', num: '0+-0.0083333', nodestart: '0', nodeend: '2', whichname: 'C', shownum: '2' },
    //   { id: '1', num: '100+0', nodestart: '0', nodeend: '1', shownum: '100' },
    // ],
    // itemlist:[
    //   { id: '0', num: '10+0', nodestart: '1', nodeend: '2', whichname: '', shownum: '10' },
    //   { id: '0', num: '8+0', nodestart: '1', nodeend: '3', whichname: '', shownum: '8' },
    //   { id: '0', num: '15+0', nodestart: '2', nodeend: '3', whichname: '', shownum: '15' },
    //   { id: '0', num: '5+0', nodestart: '0', nodeend: '2', whichname: '', shownum: '5' },
    //   { id: '1', num: '12+0', nodestart: '0', nodeend: '1', shownum: '12' },
    //   { id: '7', num1: '8+0', num2: '1+0', nodestart: '0', nodeend: '3', knodestart: '3', knodeend: '1',shownum: '1' },
    // ],//含受控源的电路
    // itemlist:[
    //   {id:'0',num:'2+0',nodestart:'2',nodeend:'3',whichname:'',shownum:'2'},
    //   { id: '0', num: '2+0', nodestart: '3', nodeend: '1', whichname: '', shownum: '2' },
    //   { id: '3', num1: '1+0', num2:'90+0', nodestart: '0', nodeend: '2', shownum1: '1',shownum2:'90' },
    //   { id: '1', num: '100+0', nodestart: '0', nodeend: '1', whichname: '', shownum: '100' },
    //   { id: '2', num: '20+0', nodestart: '0', nodeend: '3', whichname: '', shownum: '20' },
    //   { id: '1', num: '110+0', nodestart: '1', nodeend: '2', whichname: '', shownum: '110' }
    // ],//此为无受控源的直流电路

    // itemlist: [
    //   { id: '0', num: '0+1', nodestart: '0', nodeend: '3',whichname:'L',shownum:'10' },
    //   { id: '0', num: '0+-1', nodestart: '0', nodeend: '2', whichname: 'C', shownum: '19' },
    //   { id: '0', num: '1+0', nodestart: '2', nodeend: '3', whichname: '', shownum: '21' },
    //   { id: '0', num: '1+0', nodestart: '1', nodeend: '2', whichname: '', shownum: '21' },
    //   { id: '1', num: '10+0', nodestart: '0', nodeend: '1',shownum:'10' },
    // ],
    whichname:'Ω',//判断是电感还是电容还是电阻
    iscom: false,//是否是有伴电压源
    kong: true,//显示哪个输入框
  },
  begincal:function(){//开始计算
    var that = this
    var result = that.calculate(that.data.itemlist, that.data.nodenum)
    console.log("it is",result)
    var showresult = new Array()
    for (let i = 0; i < result.length; i++) {
      showresult[i] = new Array()
      result[i][0] = v.tofixed(result[i][0])
      showresult[i][0] = v.size(result[i][0]).toFixed(2) + 'V   ' + v.deg(result[i][0]).toFixed(2) + '°'
    }
    console.log(showresult)
    that.setData({
      result: showresult,
    })
    that.setData({
      currentid:3
    })
  },
  kong: function (e) {
    var that = this
    if (e.currentTarget.dataset.hi == 1) {
      that.setData({
        kong: true
      })
    } else {
      that.setData({
        kong: false
      })
    }
  },

  changetab: function (e) {//小运算的menutab
    var that = this
    that.setData({
      tab: e.currentTarget.dataset.tabid
    })
  },

  littlecal: function (e) {//小运算的运算
    var that = this
    var beginid = parseInt(e.detail.value.nodestart) - 1
    var endid = parseInt(e.detail.value.nodeend) - 1
    var result = that.data.result[beginid] - that.data.result[endid]
    var str = result + 'V'
    that.setData({
      littlecalanswer: str
    })
  },

  thevenin: function (e) {//计算两个结点的戴维宁等效电路
    var that = this
    var Uitemlist = wx.getStorageSync("itemlist")
    var nodestart = e.detail.value.nodestart
    var nodeend = e.detail.value.nodeend
    //计算开路电压Uoc，将两端口在原电路中的所有支路删除，再来连接一个超大的电阻，使其近似得可看作支路，利用节点电压法求出两结点之间的电压差，即为Uoc
    for (var p in Uitemlist) {//删除Uitemlist中连接两端口之间的元件
      if (Uitemlist[p].nodestart == nodestart && Uitemlist[p].nodeend == nodeend) {
        Uitemlist.splice(p, 1)
      } else {
        if (Uitemlist[p].nodestart == nodeend && Uitemlist[p].nodeend == nodestart) {
          Uitemlist.splice(p, 1)
        }
      }
    }
    let a = { id: '', num: '', nodestart: '', nodeend: '' }
    a.id = 0
    a.num = "10000000+0"
    a.nodestart = nodestart
    a.nodeend = nodeend
    Uitemlist.push(a)//在两节点之间接入一个极大的电阻
    var Uresult = that.calculate(Uitemlist, 4);//调用结点电压法进行计算，得到任意两结点的电压
    var Uoc = v.minus(Uresult[nodeend - 1][0] , Uresult[nodestart - 1][0])//两结点的电压差即为Uoc
    Uoc = v.tofixed(Uoc)
    var str = v.size(Uoc) + 'V '+v.deg(Uoc)+"°"
    that.setData({
      Uoc: str
    })
    Uitemlist = null

    //直接计算Req，将与无伴电压源相连的结点直接变为一个结点，先去掉所有的电流源，再把所有的有伴电压源转化为纯电阻，得出一个新的矩阵
    var Rlength = that.data.nodenum//目前的结点个数
    var Ritemlist = wx.getStorageSync("itemlist")
    //删除nodestart和nodeend之间的所有支路
    for (var p in Ritemlist) {
      if ((Ritemlist[p].nodestart == nodestart && Ritemlist[p].nodeend == nodeend) || (Ritemlist[p].nodeend == nodestart && Ritemlist[p].nodestart == nodeend)) {
        Ritemlist.splice(p, 1)
      }
    }
    //这里注意一个细节，如果你在遍历这个数组的时候修改这个数组会导致意想不到的结果，所以最好是设一个temp，先修改temp
    for (var p in Ritemlist) {
      if (Ritemlist[p].id == 1) {//如果该支路是个无伴电压源
        var thebegin = Ritemlist[p].nodestart
        var theend = Ritemlist[p].nodeend
        //第一步,删除这两个结点之间的所有支路
        for (var q in Ritemlist) {
          if ((Ritemlist[q].nodestart == thebegin && Ritemlist[q].nodeend == theend) || (Ritemlist[q].nodeend == thebegin && Ritemlist[q].nodestart == theend)) {
            Ritemlist.splice(q, 1)
          }
        }
        //第二步求出两个结点id较大的一个，然后修改所有id值,修改id时注意将nodestart与nodeend的id也要同步修改！！！注意这里修改了nodestart的值，所以后面的程序调用的时候要注意了
        var thesmaller = thebegin
        var thebigger = thebegin
        if (thebegin > theend) {
          thebigger = thebegin
          thesmaller = theend
          for (var q in Ritemlist) {
            if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
            if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
            if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
            if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
          }
        } else {
          thebigger = theend
          thesmaller = thebegin
          for (var q in Ritemlist) {
            if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
            if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
            if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
            if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
          }
        }
        //改变了nodestart和nodeend指向的位置
        if (nodestart == thebigger) { nodestart = thesmaller }
        if (nodestart > thebigger) { nodestart = nodestart - 1 }
        if (nodeend == thebigger) { nodeend = thesmaller }
        if (nodeend > thebigger) { nodeend = nodeend - 1 }
        //第三步，将Rlength减一，结束战斗
        Rlength = Rlength - 1;
        break;
      }
    }
    //再执行一次，防止一个结点连接了两个无伴电压源
    for (var p in Ritemlist) {
      if (Ritemlist[p].id == 1) {//如果该支路是个无伴电压源
        var thebegin = Ritemlist[p].nodestart
        var theend = Ritemlist[p].nodeend
        //第一步,删除这两个结点之间的所有支路
        for (var q in Ritemlist) {
          if ((Ritemlist[q].nodestart == thebegin && Ritemlist[q].nodeend == theend) || (Ritemlist[q].nodeend == thebegin && Ritemlist[q].nodestart == theend)) {
            Ritemlist.splice(q, 1)
          }
        }
        //第二步求出两个结点id较大的一个，然后修改所有id值,修改id时注意将nodestart与nodeend的id也要同步修改！！！注意这里修改了nodestart的值，所以后面的程序调用的时候要注意了
        var thesmaller = thebegin
        var thebigger = thebegin
        if (thebegin > theend) {
          thebigger = thebegin
          thesmaller = theend
          for (var q in Ritemlist) {
            if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
            if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
            if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
            if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
          }
        } else {
          thebigger = theend
          thesmaller = thebegin
          for (var q in Ritemlist) {
            if (Ritemlist[q].nodestart == thebigger) { Ritemlist[q].nodestart = thesmaller }
            if (Ritemlist[q].nodeend == thebigger) { Ritemlist[q].nodeend = thesmaller }
            if (Ritemlist[q].nodestart > thebigger) { Ritemlist[q].nodestart-- }
            if (Ritemlist[q].nodeend > thebigger) { Ritemlist[q].nodeend-- }
          }
        }
        //改变了nodestart和nodeend指向的位置
        if (nodestart == thebigger) { nodestart = thesmaller }
        if (nodestart > thebigger) { nodestart = nodestart - 1 }
        if (nodeend == thebigger) { nodeend = thesmaller }
        if (nodeend > thebigger) { nodeend = nodeend - 1 }
        //第三步，将Rlength减一，结束战斗
        Rlength = Rlength - 1;
        break;
      }
    }
    for (var p in Ritemlist) {//删除电流源
      if (Ritemlist[p].id == 2) {
        Ritemlist.splice(p, 1)
      }
    }
    for (var p in Ritemlist) {
      if (Ritemlist[p].id == 3) {
        let mm = { id: '', num: '', nodestart: '', nodeend: '' }
        mm.id = '0'
        mm.num = Ritemlist[p].num1
        mm.nodestart = Ritemlist[p].nodestart
        mm.nodeend = Ritemlist[p].nodeend
        Ritemlist.splice(p, 1, mm)
      }
    }

    //将0结点与nodestart或者nodeend交换
    var which = 'no'
    if (nodestart == 0) { which = 'start' } else {
      if (nodeend == 0) { which = 'no' } else {//如果两个结点id都不为0那就交换nodestart
        for (var p in Ritemlist) {
          if (Ritemlist[p].nodestart == 0) { Ritemlist[p].nodestart = -1 }
          if (Ritemlist[p].nodeend == 0) { Ritemlist[p].nodeend = -1 }
        }
        for (var p in Ritemlist) {
          if (Ritemlist[p].nodestart == nodestart) { Ritemlist[p].nodestart = 0 }
          if (Ritemlist[p].nodeend == nodestart) { Ritemlist[p].nodeend = 0 }
        }
        for (var p in Ritemlist) {
          if (Ritemlist[p].nodestart == -1) { Ritemlist[p].nodestart = nodestart }
          if (Ritemlist[p].nodeend == -1) { Ritemlist[p].nodestart = nodeend }
        }
        //nodestart成功设置为零结点
        nodestart = 0
        which = 'start'
      }
    }
    let I = { id: '', num: '', nodestart: '', nodeend: '' }
    I.id = '1'
    I.num = '10+0'
    I.nodestart = nodestart
    I.nodeend = nodeend
    Ritemlist.push(I)//在端点中通入1V的电流源
    //Ritemlist修改完毕，nodestart和nodeend修改完毕，Rlength修改完毕，准备求值
    if (Rlength == 2) {//如果剩下就一个支路，则电阻就是这个支路的电阻
      var Req = Ritemlist[0].num
    } else {
      var Rresult = that.calculate(Ritemlist, Rlength)
      var Isum = "0+0"
      for (var p in Ritemlist) {
        if (Ritemlist[p].id == 0) {
          if (Ritemlist[p].nodestart == 0) { Isum = v.plus(Isum, v.devide(Rresult[Ritemlist[p].nodeend - 1][0], Ritemlist[p].num)) }
          if (Ritemlist[p].nodeend == 0) { Isum = v.plus(Isum, v.devide(Rresult[Ritemlist[p].nodestart - 1][0], Ritemlist[p].num)) }
        }
      }
      var Req = v.devide("10+0",Isum)
    }
    var str 
    if (v.virtual(Req) == 0) str= v.size(Req).toFixed(2) + 'Ω'
    else str = v.tofixed(Req) + 'i'
    that.setData({
      Req: str
    })
  },

  again: function () {//再次进行运算
    var that = this
    that.setData({
      nodenum: 0,
      itemlist: that.data.Null,
      currentid: 0,
      result: that.data.Null,
      littlecalanswer: that.data.Null
    })
  },

  notcom: function (e) {
    var that = this
    that.setData({
      iscom: false,
      inputid: e.currentTarget.dataset.inputid,
      
    })
    if (e.currentTarget.dataset.name) { that.setData({ whichname: e.currentTarget.dataset.name})}
  },

  iscom: function () {
    var that = this
    that.setData({
      iscom: true
    })
  },

  calculate: function (itemlist,nodenum) {
    var that = this
    var height = nodenum
    var mheight = height - 1
    var Rresult = new Array();
    var Iresult = new Array();
    console.log("itemlist",itemlist)
    var badnodeslist = new Array()//存储一个带三个key值的json，start结点，end结点，两结点之间的值 
    for (let i = 0; i <= height; i++) {//查找bad_nodes,即结点之间是一个电压源
      for (let j = height; j > i; j--) {//i>j节省运算成本
        var badnodes = { nodestart: '', nodeend: '', nodevalue: '' }
        for (var p in itemlist) {
          if (itemlist[p].id == 1) {
            if (itemlist[p].nodestart == i && itemlist[p].nodeend == j) {
              badnodes.nodestart = i
              badnodes.nodeend = j
              badnodes.nodevalue = itemlist[p].num
              badnodeslist.push(badnodes)
            }
          }
        }
      }
    }
    for (let k = 0; k < mheight; k++) {
      Rresult[k] = new Array()
      Iresult[k] = new Array()
    }
    for (let i = 0; i < mheight; i++) {//获取自阻矩阵
      var Uid = i + 1//结点id
      for (let j = 0; j < mheight; j++) {
        var Uid2 = j + 1//纵向结点id
        var Rsum = "0+0";
        if (Uid2 == Uid) {//如果当前结点是自阻
          for (var p in itemlist) {
            if (itemlist[p].id == 0) {
              if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                Rsum = v.plus(Rsum,v.revise(itemlist[p].num))
              }
            }
            if (itemlist[p].id == 3) {//有伴电压源的电阻
              if (itemlist[p].nodestart == Uid || itemlist[p].nodeend == Uid) {
                Rsum = v.plus(Rsum, v.revise(itemlist[p].num1))
              }
            }
          }
        } else {//是互阻，i+1作为起始结点，j+1作为结束结点
          for (var p in itemlist) {
            if (itemlist[p].id == 0) {
              if ((itemlist[p].nodestart == Uid && itemlist[p].nodeend == Uid2) || (itemlist[p].nodestart == Uid2 && itemlist[p].nodeend == Uid)) {
                Rsum = v.minus(Rsum, v.revise(itemlist[p].num))
              }
            }
          }
        }
        Rresult[i][j] = Rsum
      }
    }
    for (let i = 0; i < mheight; i++) {//获取电流矩阵
      var id = i + 1
      var Isum = "0+0";
      var Uid = i + 1
      for (var p in itemlist) {
        if (itemlist[p].id == 2) {
          if (itemlist[p].nodestart == Uid) {//流出为负
            Isum = v.minus(Isum,itemlist[p].num)
          }
          if (itemlist[p].nodeend == Uid) {//流入为正
            Isum = v.plus(Isum,itemlist[p].num)
          }
        }
        if (itemlist[p].id == 3) {
          if (itemlist[p].nodestart == Uid) {
            Isum = v.minus(Isum,v.devide(itemlist[p].num2,itemlist[p].num1))
          }
          if (itemlist[p].nodeend == Uid) {
            Isum = v.plus(Isum, v.devide(itemlist[p].num2, itemlist[p].num1))
          }
        }
      }
      Iresult[i][0] = Isum
    }
    //根据无伴电压源对上述矩阵做修正
    if (badnodeslist != '') {
      for (var p in badnodeslist) {
        if (badnodeslist[p].nodestart == 0) {
          for (let j = 0; j < mheight; j++) {
            if (j + 1 == badnodeslist[p].nodeend) {
              Rresult[badnodeslist[p].nodeend - 1][j] = "1+0"
              Iresult[badnodeslist[p].nodeend - 1][0] = badnodeslist[p].nodevalue
            } else {
              Rresult[badnodeslist[p].nodeend - 1][j] = "0+0"
            }
          }
        } else {
          if (badnodeslist[p].nodeend == 0) {
            for (let j = 0; j < mheight; j++) {
              if (j + 1 == badnodeslist[p].nodeend) {
                Rresult[badnodeslist[p].nodeend - 1][j] = "1+0"
                Iresult[badnodeslist[p].nodeend - 1][0] = v.opposite(badnodeslist[p].nodevalue)
              } else {
                Rresult[badnodeslist[p].nodeend - 1][j] = "0+0"
              }
            }
          } else {
            for (let j = 0; j < mheight; j++) {//改变电压源末端结点的方程，
              if (j + 1 == badnodeslist[p].nodeend) {
                Rresult[badnodeslist[p].nodeend - 1][j] = "1+0"
                Iresult[badnodeslist[p].nodeend - 1][0] = badnodeslist[p].nodevalue
              } else {
                if (j + 1 == badnodeslist[p].nodestart) {
                  Rresult[badnodeslist[p].nodeend - 1][j] = "-1+0"
                }
                else {
                  Rresult[badnodeslist[p].nodeend - 1][j] = "0+0"
                }
              }
            }
          }
        }
      }
    }
    //根据受控源对上述矩阵做修正
    for (var p in itemlist) {
      if (itemlist[p].id == 4) {//是电压控制电压源,受控源是控源的倍数，如果是接地的什么都不用做
        for (let j = 0; j < mheight; j++) {
          Rresult[itemlist[p].nodeend - 1][j] = 0
        }
        Rresult[itemlist[p].nodeend - 1][itemlist[p].nodeend - 1] = "1+0"
        Rresult[itemlist[p].nodeend - 1][itemlist[p].nodestart - 1] = "-1+0"
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] = v.minus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] ,itemlist[p].num)
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] = v.plus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1],itemlist[p].num)
      }
      if (itemlist[p].id == 5) {//是电压控制电流源
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] = v.plus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1], itemlist[p].num)
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] = v.minus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1],itemlist[p].num)
        Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1] = v.minus(Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1],itemlist[p].num)
        Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1] = v.plus(Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1],itemlist[p].num)
      }
      if (itemlist[p].id == 6) {//是电流控制电压源，起始在参数上做个修正就行了通过将所给系数除以控制支路电阻即可
        for (let j = 0; j < mheight; j++) {
          Rresult[itemlist[p].nodeend - 1][j] = "0+0"
        }
        Rresult[itemlist[p].nodeend - 1][itemlist[p].nodeend - 1] = "1+0"
        Rresult[itemlist[p].nodeend - 1][itemlist[p].nodestart - 1] = "-1+0"
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] = v.plus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1],v.devide(itemlist[p].num2 ,itemlist[p].num1))
        Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] = v.minus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1], v.devide(itemlist[p].num2, itemlist[p].num1))
      }
      if (itemlist[p].id == 7) {//是电流控制电流源，同理
        if (itemlist[p].knodeend != 0) {//如果控制支路电流的末结点不为0
          if (itemlist[p].nodeend != 0) {//如果受控源的末结点不为零
            Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1] = v.plus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodeend - 1], v.devide(itemlist[p].num2, itemlist[p].num1))
          }
          if (itemlist[p].nodestart != 0) {
            Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1] = v.plus(Rresult[itemlist[p].nodestart - 1][itemlist[p].knodeend - 1], v.devide(itemlist[p].num2, itemlist[p].num1))
          }
        }
        if (itemlist[p].knodestart != 0) {
          if (itemlist[p].nodeend != 0) {
            Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1] = v.minus(Rresult[itemlist[p].nodeend - 1][itemlist[p].knodestart - 1], v.devide(itemlist[p].num2, itemlist[p].num1))
          }
          if (itemlist[p].nodestart != 0) {
            Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1] = v.minus(Rresult[itemlist[p].nodestart - 1][itemlist[p].knodestart - 1], v.devide(itemlist[p].num2, itemlist[p].num1))
          }
        }

      }
    }
    console.log("Rresult=", Rresult)
    console.log("Iresult=", Iresult)
    var temp = m.inverse(Rresult)
    var result = m.multiply(temp, Iresult)
    console.log(result)
    return result
  },
  railnum: function (e) {
    var that = this
    var length = that.data.nodenum
    var k = new Array();
    k[0] = e.detail.value.one_0
    k[1] = e.detail.value.one_1
    k[2] = e.detail.value.one_2//再想办法
    that.setData({
      currentid: 3,
      railnum: k
    })
  },
  add: function () {//增加元件
    var that = this
    that.setData({
      showadd: true
    })
  },
  add2: function () {
    var that = this
    that.setData({
      showaddk: true
    })
  },
  disshowadd: function (e) {//提交增加元件的表单
    var that = this
    if (e.detail.value.id == 3) {
      let a = { id: '', num1: '', num2: '', nodestart: '', nodeend: '',shownum1:'',shownum2:'' }
      a.id = e.detail.value.id
      a.num1 = parseFloat(e.detail.value.num1)+"+0"
      a.num2 = parseFloat(e.detail.value.num2)+"+0"
      a.shownum1 = parseFloat(e.detail.value.num1)
      a.shownum2 = parseFloat(e.detail.value.num2)
      a.nodestart = e.detail.value.nodestart
      a.nodeend = e.detail.value.nodeend
      var temp = that.data.itemlist
      temp.push(a)
      that.setData({
        itemlist: temp
      })
      that.setData({
        showadd: false,
      })
    } else {
      if (e.detail.value.id > 3) {//受控源
        switch (parseInt(e.detail.value.id)) {
          case 4: {//电压控制电压源
          console.log("here")
            let a = { id: '', num: '', nodestart: '', nodeend: '', knodestart: '', knodeend: ''}
            a.id = e.detail.value.id
            a.num = parseFloat(e.detail.value.num) + "+0"//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showaddk: false,
            })
            break;
          }
          case 5: {//电压控制电流源
            let a = { id: '', num: '', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num = parseFloat(e.detail.value.num) + "+0"//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showaddk: false,
            })
            break;
          }
          case 6: {//电流控制电压源
            let a = { id: '', num1: '', num2: '', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num1 = e.detail.value.num1//电阻
            a.num2 = parseFloat(e.detail.value.num2) + "+0"//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showaddk: false,
            })
            break;
          }
          case 7: {//电流控制电流源
            let a = { id: '', num1: '', num2: '', nodestart: '', nodeend: '', knodestart: '', knodeend: '' }
            a.id = e.detail.value.id
            a.num1 = e.detail.value.num1//电阻
            a.num2 = parseFloat(e.detail.value.num2)+"+0"//控制系数
            a.nodestart = e.detail.value.nodestart
            a.nodeend = e.detail.value.nodeend
            a.knodestart = e.detail.value.knodestart//控制端的起始终止结点
            a.knodeend = e.detail.value.knodeend
            var temp = that.data.itemlist
            temp.push(a)
            that.setData({
              itemlist: temp
            })
            that.setData({
              showaddk: false,
            })
            break;
          }
        }
      } else {
        if(parseInt(e.detail.value.id)==0){//阻抗
          let a = { id: '', num: '', nodestart: '', nodeend: '',whichname:'',shownum:'' }
          a.id = e.detail.value.id
          var w = that.data.w
          switch(that.data.whichname){
            case 'Ω':
              a.shownum = parseFloat(e.detail.value.num)
              a.num = parseFloat(e.detail.value.num)+"+0"
            break;
            case 'C':
              a.shownum = parseFloat(e.detail.value.num)
              a.whichname = 'C'
              if (w == 0) a.num = "0+100000000000"
              else a.num = "0+-"+1/(parseFloat(e.detail.value.num)*w)
            break;
            case 'L':
              a.shownum = parseFloat(e.detail.value.num)
              a.whichname = 'L'
              if (w == 0) a.num = "0+0.00000000000001"
              else a.num = "0+" + (parseFloat(e.detail.value.num) * w)
            break;
          }
          a.nodestart = e.detail.value.nodestart
          a.nodeend = e.detail.value.nodeend
          var temp = that.data.itemlist
          temp.push(a)
          that.setData({
            itemlist: temp
          })
          that.setData({
            showadd: false,
            iscom: false,
            inputid: 0,
          })
        }else{
          let a = { id: '', num: '', nodestart: '', nodeend: '',shownum:'' }
          a.id = e.detail.value.id
          a.num = parseFloat(e.detail.value.num)+"+0"
          a.shownum = parseFloat(e.detail.value.num)
          a.nodestart = e.detail.value.nodestart
          a.nodeend = e.detail.value.nodeend
          var temp = that.data.itemlist
          temp.push(a)
          that.setData({
            itemlist: temp
          })
          that.setData({
            showadd: false,
            iscom: false,
            inputid: 0,
          })
        }
      }
    }
  },
  nodenum: function (e) {
    var that = this
    that.setData({
      currentid: 2,
      nodenum: parseInt(e.detail.value.num),
      w:parseFloat(e.detail.value.w)
    })
  },
  start: function () {
    var that = this
    that.setData({
      currentid: 1
    })
  },
  onLoad: function () {
    var that = this
    wx.setStorageSync('itemlist', that.data.itemlist)
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      },
    })
  },
})
