 import v from "virtual.js"
 function adjoint(matrix) {//求一个矩阵的伴随矩阵
    var that = this
    var length = matrix.length
    if (length == 2) {//长度为2，另做考虑
      var result = new Array();
      for (let k = 0; k < 2; k++) {
        result[k] = new Array()
      }
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          if ((i + j) % 2 == 0) { result[i][j] = matrix[1 - i][1 - j] }
          else { result[i][j] = v.opposite(matrix[1 - j][1 - i]) }
        }
      }
    } else {
      var result = new Array();
      for (let k = 0; k < length; k++) {
        result[k] = new Array()
      }
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          var temp = new Array();
          for (let k = 0; k < length - 1; k++) {
            temp[k] = new Array()
          }
          for (let m = 0; m < length - 1; m++) {//ij位置的余子阵
            for (let n = 0; n < length - 1; n++) {
              if (m < i) {
                if (n < j) { temp[m][n] = matrix[m][n] } else { temp[m][n] = matrix[m][n + 1] }
              } else {
                if (n < j) { temp[m][n] = matrix[m + 1][n] } else { temp[m][n] = matrix[m + 1][n + 1] }
              }
            }
          }
          if ((i + j) % 2 == 0) {
            result[i][j] = that.matrixcal(temp)
          } else {
            result[i][j] = v.opposite(that.matrixcal(temp))
          }
        }
      }
      result = that.transpose(result)
    }

    return result;
  }
function transpose(matrix) {//矩阵转置
    var that = this
    var height = matrix.length
    var width = matrix[0].length
    var result = new Array();
    for (let k = 0; k < height; k++) {
      result[k] = new Array();
    }
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        result[j][i] = matrix[i][j]
      }
    }
    return result;
  }
  function multiply(matrix, matrix2) {//输入俩个矩阵，返回俩个矩阵的乘积
    var that = this
    var width = matrix2[0].length//列数
    var height = matrix.length//行数
    var len = matrix[0].length//公共边长度
    var result = new Array();
    for (let k = 0; k < height; k++) {
      result[k] = new Array();
    }
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        var sum = "0+0";
        for (let m = 0; m < len; m++) {
          sum = v.plus(sum , v.times(matrix[i][m] ,matrix2[m][j]))
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  function inverse(matrix) {//输入一个矩阵，返回它的逆矩阵
    var that = this
    var hang = that.matrixcal(matrix)
    var matrix = that.adjoint(matrix)
    var length = matrix.length
    for (let m = 0; m < length; m++) {
      for (let n = 0; n < length; n++) {
        if (v.iszero(matrix[m][n])) {
          matrix[m][n] = "0+0"
        } else {
          matrix[m][n] = v.devide(matrix[m][n] , hang)
        }
      }
    }
    return matrix;
  }
  function matrixcal(smatrix) {//输入一个矩阵,返回它的行列式的值
    var that = this
    var slength = smatrix.length
    var sum = "0+0";
    if (slength == 2) {//如果输入行列式的长为2则直接运算
      sum = v.minus(v.times(smatrix[0][0] , smatrix[1][1]) , v.times(smatrix[1][0] , smatrix[0][1]))
    } else {
      for (let i = 0; i < slength; i++) {
        var juzhen = new Array()
        for (let p = 0; p < slength - 1; p++) {
          juzhen[p] = new Array()
        }
        for (let m = 0; m < slength - 1; m++) {
          for (let n = 0; n < slength - 1; n++) {
            if (m < i) {
              juzhen[m][n] = smatrix[m + 1][n]
            }
            else {
              juzhen[m][n] = smatrix[m + 1][n + 1]
            }
          }
        }//将余子式赋给一个新的矩阵
        if (i % 2 == 0) { sum = v.plus(v.times(smatrix[0][i] , that.matrixcal(juzhen)) , sum); }
        else { sum = v.minus(sum,v.times(smatrix[0][i] , that.matrixcal(juzhen))); }
      }
    }
    return sum;
  }

module.exports = {
  adjoint:adjoint,//求伴随 矩阵
  transpose:transpose,//求矩阵转置
  multiply:multiply,//矩阵相乘
  inverse:inverse,//矩阵求逆
  matrixcal:matrixcal//矩阵求行列式
}