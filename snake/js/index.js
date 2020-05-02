alert("引入成功");
var sw=20, //一个方块的宽
    sh=20, //一个方块的高
    tr=30, //行数
    td=30; //列数

var snake = null;//蛇的实例

var sw = document.getElementById('snakeWrap');

var su = document.querySelector('ul');
var sl = document.querySelector('li');
sl.onmouseover = function(){
    this.className = 'select';
}
var sd = document.createElement('li');
ul.appendChild(sd);

//方块构造函数
function Square(x,y,classname){
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;

    this.viewContent = document.createElement('div');//方块对应的DOM元素
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');//方块的父级
}
Square.prototype.create = function(){//创建方块DOM 
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    this.parent.appendChild(this.viewContent);
    console.log(1);
};
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
}
//蛇
function Snake(){
    this.head = null;//存一下蛇头的信息
    this.tail = null;//存一下蛇尾的信息
    this.pos = [];//存储蛇身上每一个方块的位置

    this.directionNum = {//存储蛇走的方向，用一个对象来表示

    }
}
Snake.prototype.init = function(){//初始化
    //创建一个蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    console.log(1);
    snakeHead.create();
    
}
snake = new Snake();
snake.init();

var ppp = new Square(1,1,'food');
ppp.create();