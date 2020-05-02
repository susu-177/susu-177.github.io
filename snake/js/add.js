//禁用方向键控制滚动条
document.body.onkeydown = function (e) {
    if (e.keyCode == 38 || e.keyCode == 40) {
       return false;
    }
  }

var sw=20, //一个方块的宽
    sh=20, //一个方块的高
    tr=30, //行数
    td=30; //列数

var snake = null,//蛇的实例
    food = null,//食物的实例
    game = null;//游戏的实例

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
        left:{//往左边走改变的坐标
            x:-1,
            y:0,
            rotate:180 //蛇头在向左走时，旋转180度
        },
        right:{
            x:1,
            y:0,
            rotate:0 
        },
        up:{
            x:0,
            y:-1,
            rotate:-90 
        },
        down:{
            x:0,
            y:1,
            rotate:90 
        }

    }
}
Snake.prototype.init = function(){//初始化
    //创建一个蛇头
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head = snakeHead;//存储蛇头信息
    this.pos.push([2,0]);//存储蛇头位置


    //创建蛇身体
    var snakeBody1 = new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);

    var snakeBody2 = new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail = snakeBody2;
    this.pos.push([0,0]);


    //形成链表关系
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;

    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    //给蛇添加一个默认属性，用来表示蛇走的方向
    this.direction = this.directionNum.right;//默认蛇往右走
};

//用于获取蛇头的下一个位置对应的元素，根据不同元素做不同的事情
Snake.prototype.getNextPos = function(){
    var nextPos = [  //蛇头要走的下一个点的坐标
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y
    ]
    console.log(this.direction.x);
    //下个点是自己，游戏结束
    var selfCollied = false;
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfCollied = true;
        }
    });
    if(selfCollied){
        console.log('撞到自己了');
        this.strategies.die.call(this);
        // 在strategies方法中，由于调用die的对象是this.strategies，
        // 而需要用到Snake的相关属性，所以采用这样的方法，将Snake对象传进去
        return;
    }
    //下个点是围墙，游戏结束
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>td-1 || nextPos[1]>tr-1){
        console.log('撞墙了');
        this.strategies.die.call(this);
        return;
    }
    //下个点是食物，吃
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        this.strategies.eat.call(this);
        return;
    }
    //什么都不是，走
    this.strategies.move.call(this);
};

//处理碰撞后发生的事
Snake.prototype.strategies ={
    move:function(format){//这个参数用于决定要不要删除蛇尾
        //创建一个新身体，在旧蛇头的位置
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;

        this.head.remove();
        newBody.create();

        //创建一个新蛇头
        var newHead = new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
        //更新链表的关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+this.directionNum+'deg)';
        newHead.create();

        //蛇身上每一个方块的位置也要更新
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        this.head = newHead;//更新this.head

        if(!format){//如果下一个位置不是苹果，删除蛇尾
            this.tail.remove();
            //更新链表
            this.tail = this.tail.last;

            this.pos.pop();//将数组最后一个元素删除

        }
    },
    eat:function(){
        this.strategies.move.call(this,true);
        createFood();
        game.score++;
    },
    die:function(){
        game.over();
    }
}

snake = new Snake();


//创建食物
function createFood(){
    //食物小方块的随机坐标
    var x=null,y=null;
    var include =true; //循环跳出的条件
    while(include){
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));

        snake.pos.forEach(function(value){
            if(x!=value[0] && y!=value[1]){
                //随机出来的坐标，在蛇身上没有出现
                include = false;
            }

        });

        //生成食物
        food = new Square(x,y,'food');
        food.pos = [x,y];//存储生成食物的坐标
        var foodDom = document.querySelector('.food');
        if(foodDom){
            foodDom.style.left = x*sw + 'px';            
            foodDom.style.top = y*sh + 'px';            

        }else{
            food.create();

        }
        
    }
}


//创建游戏方法
function Game(){
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function(){
    snake.init();
    snake.getNextPos();
    createFood();

    document.onkeydown = function(ev){
        var ev = ev||window.ev;
        if(ev.keyCode == 37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left;
        }else if(ev.keyCode == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up;
        }else if(ev.keyCode == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right;
        }else if(ev.keyCode == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}
Game.prototype.start = function(){ // 开始游戏
    this.timer = setInterval(function(){
        snake.getNextPos();
    },200);
}
Game.prototype.pause = function(){//暂停游戏
    clearInterval(this.timer);

}
Game.prototype.over = function(){
    clearInterval(this.timer);//清除定时器
    this.statistics();
    //游戏回到最初始的状态
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';

}

//游戏数据统计
Game.prototype.statistics =function(){
    var sta = document.getElementById('statistics');
    sta.style.display = 'block';
    var score = sta.querySelector('p');
    score.innerHTML = '得分：'+this.score;
}
//开启游戏

var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
    startBtn.parentNode.style.display = 'none';
    game = new Game();
    game.init();
}

//暂停游戏

var snakeWrap = document.getElementById('snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
    game.pause();
    pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function(){
    game.start();
    pauseBtn.parentNode.style.display = 'none';

}
