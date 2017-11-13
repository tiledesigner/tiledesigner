function Canvas(id){
  var c = document.getElementById(id);
  var ctx = c.getContext("2d");
  this.context=ctx;
  
  /*** Basic Functions***/
  
  function ArrayCopy(array){
    if(typeof(array)!="object"){
      return array;
    }
    else{
      var a=[];
      var s;
      for (var i in array){
        s=array.slice()
        a.push(ArrayCopy(s[i]))
      }
      return a;  
    }
  }
  
  function ArrayEqual(array1,array2){
      if(array1.length!=array2.length){
        return false;
      }
      else
      var test=true;
      for (var i=0;test&&(i<array1.length);i++){
        test=test&&((typeof(array1[i])=="object"&&typeof(array2[i])=="object")&&(ArrayEqual(array1[i],array2[i])))||(test=array1[i]==array2[i])
      }
      return test;
    }
  
  /*** Tile Board functions ***/

  this.AskSize=function(){
    return Number(document.getElementById("Nsquares").value)};
  
  this.AskSizeL=function(){
    var d=document.getElementById(id);
    var w=Number(d.width);
    var h=Number(d.height);
    var size=this.MatrixSize();
    return Math.min((w-w%size)/size,(h-h%size)/size);
  };
  
  this.AskColor=function(){
    if(document.getElementById("ColorTransparency").checked){
        return "transparent";
      }
      else return document.getElementById("ColorPicker").value;
  };
  
  this.DrawSquare = function(xc,yc,l,style){
    this.context.beginPath();
    this.context.strokeStyle=style;
    this.context.rect(xc,yc,l,l);
    this.context.stroke();
  return this;
  };

  this.DrawSquareTransparent = function(xc,yc,l){
    this.FillSquare(xc,yc,l,"white");
    this.DrawSquare(xc,yc,l,"gray");
    this.context.beginPath();
    this.context.moveTo(xc+l/10,yc+l/10);
    this.context.lineTo(xc+9*l/10,yc+9*l/10);
    this.context.stroke();
  return this;
  };

  this.FillSquare = function(xc,yc,l,style){
    if(style=="transparent"){
      this.DrawSquareTransparent(xc,yc,l);
    }
    else{
      this.context.beginPath();
      this.context.fillStyle=style;
      this.context.fillRect(xc,yc,l,l);
    }
  return this;
  };
  
  this.DrawPixel=function(x,y,style){
    var l=this.AskSizeL();
    this.FillSquare((x-1)*l,(y-1)*l,l,style);
    this.DrawSquare((x-1)*l,(y-1)*l,l,"white");
    return this;
  };

  this.UpdatedTileLastColor='transparent';
  this.UpdatedTileLastXY=[0,0];

  this.UpdateTile=function(x,y,color){
    if(ArrayEqual([x,y],this.UpdatedTileLastXY)&&(color==this.MatrixRead(x,y))){
      var c=this.UpdatedTileLastColor;
      this.UpdatedTileLastColor=this.MatrixRead(x,y);
      this.UpdatedTileLastXY=[x,y];
      this.DrawPixel(x,y,c);
      this.MatrixSet(x,y,c);
    }
    else{
      this.UpdatedTileLastColor=this.MatrixRead(x,y);
      this.UpdatedTileLastXY=[x,y];
      this.DrawPixel(x,y,color);
      this.MatrixSet(x,y,color);
    return this;
    }
  };
  
  this.ClickTile= function(event){
    this.UndoCapture();
    var l=this.AskSizeL();
    var x =event.offsetX;
    var y =event.offsetY;
    x=1+(x-x%l)/l;
    y=1+(y-y%l)/l;
    this.UpdateTile(x,y,this.AskColor());
  return this;
  };
  
  this.PrintBoard=function(){
    document.getElementById("PrintedBoard").innerHTML = this.MatrixParse();
  };
  
  this.ClearBoard=function(){
    this.UndoCapture();
    var size=this.MatrixSize();
    for(var i=1;i<=size;i++){
      for(var j=1;j<=size;j++){
        this.UpdateTile(i,j,"transparent");
      }
    }
    return this;
  };

  this.UpdateBoard=function(){
    ctx.clearRect(0, 0, c.width, c.height);
    var size =this.MatrixSize();
    for(var i=1;i<=size;i++){
      for(var j=1;j<=size;j++){
        this.UpdateTile(i,j,this.MatrixRead(i,j));
      }
    }
    return this;
  };
  
  this.ChangeBoardSize=function(){
    this.UndoCapture();
    this.MatrixResize();
    this.UpdateBoard();
    return this;  
  };
  
  /*
  this.Editable=true;
  this.EditDisable=function(){this.Editable=false}
  this.EditEnable=function(){this.Editable=true}
  */
  /*** Undo Redo***/

  this.UndoCapture=function(){
    if(this.UndoQueueIndex==this.UndoQueue.length-1){
      this.UndoQueue.push(ArrayCopy(this.Matrix));
      this.UndoQueueIndex++;
    }
    else{
      while(this.UndoQueue.length-1>this.UndoQueueIndex){
        this.UndoQueue.pop();
      }
      this.UndoCapture();
    }
    return this;
  };
  
  this.Undo=function(){
    if(this.UndoQueueIndex>=1){
    this.Matrix=ArrayCopy(this.UndoQueue[this.UndoQueueIndex-1]);
    this.UndoQueueIndex--
    this.UpdateBoard();
    return this;
    }
  };
  
   this.Redo=function(){
    if(this.UndoQueueIndex<this.UndoQueue.length-1){
    this.Matrix=ArrayCopy(this.UndoQueue[this.UndoQueueIndex+1]);
    this.UndoQueueIndex++;
    this.UpdateBoard();
    return this;
    }
  };

  /*** Matrix functions ***/

  this.MatrixSize=function(){return this.Matrix.length};

  this.MatrixReset=function(){
    var l = this.AskSize();
    
      function NewMatrix(){
        var datamatrix = [];
        for (i = 0; i < l; i++) {
          datamatrix [i]=[];
          for (j = 0; j < l; j++) {
            datamatrix[i][j]='transparent';
          } 
        }
        return datamatrix;
      }
      this.Matrix=NewMatrix();
      
      this.UndoQueue=[ArrayCopy(this.Matrix)];
      this.UndoQueueIndex=0;

      return this;
    };

  this.MatrixResize=function(){
      var m=this.Matrix;
      var oldsize=this.MatrixSize();
      var newsize=this.AskSize();
      if(oldsize==newsize||newsize<1){
        return this;
      }
      else if (oldsize>newsize){
        var n=m.slice(0,newsize);
        for(var i in n){
          n[i]=m[i].slice(0,newsize);
        }
        this.Matrix=n;
        return this;
      }
      else {
        var llx=[];
        for (var kk=1;kk<=newsize;kk++){llx.push('transparent');}
        llx=[llx];
        var lx=[];
        for(var j=oldsize;j<newsize;j++){lx.push('transparent');}
          var mm;
        for(var k=0;k<oldsize;k++){
          m[k]=m[k].concat(lx);
         }
        for(k=oldsize;k<newsize;k++){m=m.concat(llx);}
        this.Matrix=m;
        return this;
      }
    };
  
  this.MatrixSet=function(x,y,color){
    var m=this.Matrix;
    m[y-1][x-1]=color;
    this.Matrix=m;
    return this;
  };
  
  this.MatrixRead=function(x,y){
      var m=this.Matrix;
      return m[y-1][x-1];
  };

  this.MatrixParse=function(){
      var text=""
      var colorlist=[];
      var n=ArrayCopy(this.Matrix);
      for(var i in n){
        for(var j in n[i]){
          if (colorlist.indexOf(n[i][j])==-1){
            colorlist.push(n[i][j]);
          }
          n[i][j]=colorlist.indexOf(n[i][j]);
        }
        n[i]=n[i].join(",");
      }
      n=n.join("\n");
      text=text+colorlist.join(" ")+"\n"+n;
    return(text);
    };
    
  /*** Color lists***/
  
  /******/  
  this.MatrixReset();

}

var canvas=new Canvas("TileEditor");
canvas.ClearBoard().UpdateTile(2,3,"orange")


