/*** Basic Array Functions***/
  
  function ArrayCopy(array){
    if(typeof(array)!="object"){
      return array;
    }
    else{
      var a=[];
      var s;
      for (var i in array){
        s=array.slice();
        a.push(ArrayCopy(s[i]));
      }
      return a;  
    }
  }
  
  function ArrayEqual(array1,array2){
      if(array1.length!=array2.length){
        return false;
      }
      else{
      var test=true;
      for (var i=0;test&&(i<array1.length);i++){
        test=test&&((typeof(array1[i])=="object"&&typeof(array2[i])=="object")&&(ArrayEqual(array1[i],array2[i])))||(test=array1[i]==array2[i]);
      }
      return test;}
    }
    
  function MatrixMap(matrix,f){
    var m=ArrayCopy(matrix);
    for(var i in m){for (var j in m[i]){m[i][j]=f(m[i][j])}}
    return m;
  }

  function Fold(fu,ar){
  
  if(ar.length===1){
    return ar[0];
  }
  else{
    var FoldR=function(f,arra,result){
      if(arra.length<=0){
        return result;
      }
      else{
        var z=arra[0];
        var arr=arra;
        arr.shift();
        return FoldR(f,arr,f(result,z));
  }};
  
  var a=ar;
  u=a[0];
  a.shift();
  return FoldR(fu,a,u);
  }
}

  function ReplaceRe(text,token,instructions){
    var t=text;
    var tr=t.replace(token,instructions);
    while(tr!=t){
      t=tr;
      tr=tr.replace(token,instructions);
    }
  return tr;
  }

  function ReplaceReLi(text,tokeninstructionspairs){
    return Fold(
        function(x,y){return ReplaceRe(x,y[0],y[1])},
        [text].concat(tokeninstructionspairs));
  }
/*** Keybindings***/
document.onkeydown = function(e){
    var evtobj = (window.event? window.event : e);
    if (evtobj.keyCode == 90 && evtobj.ctrlKey){
      canvas.Undo();
    }
    if (evtobj.keyCode == 89 && evtobj.ctrlKey){
      canvas.Redo();
    }
  };
/*** Main***/
function Canvas(id){
  var c = document.getElementById(id);
  var ctx = c.getContext("2d");
  this.context=ctx;
  
  /*** Tile Board (Canvas) functions ***/

  this.AskTitle=function(){
    var title=this.ParseTileTitle(document.getElementById("TileTitle").value);
    if(title===""){title=this.ParseTileTitle(document.getElementById("TileTitle").placeholder);}
    return title;
  };
  
  this.TitleLoad=function(title){
    document.getElementById("TileTitle").value=title;
    return this;
  };
  
  this.AskSize=function(){
    return Number(document.getElementById("Nsquares").value);};
  
  this.AskSizeL=function(){
    var d=document.getElementById(id);
    var w=Number(d.width);
    var h=Number(d.height);
    var size=this.MatrixSize();
    return Math.min((w-w%size)/size,(h-h%size)/size);
  };
  
  this.AskColor=function(){
    if(document.getElementById("ColorTransparency").getAttribute("aria-pressed")==="true"){
        return "transparent";
      }
      else return document.getElementById("ColorPicker").value;
  };
  
  this.SetColor=function(color){
    if(color==="transparent"){
      document.getElementById("ColorTransparency").setAttribute("aria-pressed","true");
    }
    else{
      document.getElementById("ColorTransparency").setAttribute("aria-pressed","false");
      document.getElementById("ColorPicker").value=color;
    }
    return this;
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

  this.UpdateTileClick=function(x,y,color){
    if(ArrayEqual([x,y],this.UpdatedTileLastXY)&&(color==this.MatrixRead(x,y))){
      var c=this.UpdatedTileLastColor;
      this.UpdatedTileLastColor=this.MatrixRead(x,y);
      this.UpdatedTileLastXY=[x,y];
      this.DrawPixel(x,y,c);
      this.MatrixSet(x,y,c);
    }
    else if(color==this.MatrixRead(x,y)){
      this.UpdatedTileLastColor=this.MatrixRead(x,y);
      this.UpdatedTileLastXY=[x,y];
      this.DrawPixel(x,y,"transparent");
      this.MatrixSet(x,y,"transparent");
    }
    else{
      this.UpdatedTileLastColor=this.MatrixRead(x,y);
      this.UpdatedTileLastXY=[x,y];
      this.DrawPixel(x,y,color);
      this.MatrixSet(x,y,color);
    return this;
    }
  };
  
  this.UpdateTile=function(x,y,color){
      this.DrawPixel(x,y,color);
      this.MatrixSet(x,y,color);
      return this;
  };
  
  this.ClickTile= function(event){
    var l=this.AskSizeL();
    var x =event.offsetX;
    var y =event.offsetY;
    x=1+(x-x%l)/l;
    y=1+(y-y%l)/l;
    this.UpdateTileClick(x,y,this.AskColor());
    this.ColorCapture();
    this.UndoCapture();
  return this;
  };
  
  this.ParseTileTitle=function(title){
    var inclusions="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var exclusions=[];
    for(var i in inclusions){
      exclusions.push([inclusions[i],""])
    }
    inclusions=ReplaceReLi(title,exclusions);
    exclusions=[];
    for(var j in inclusions){
      exclusions.push([inclusions[j],""])
    }
    return ReplaceReLi(title,exclusions);
  }

  this.TileUnparse=function(title,matrix){
    return title+"\n"+this.MatrixParse(matrix);
  };
  
  this.TilesetUnparse=function(tileset){
    var code="";
    for(i in tileset["names"]){
      code+=this.TileUnparse(tileset["names"][i],tileset["tiles"][i])+"\n\n"
    }
    return code;
  }
  
  this.ChangeAttribute=function(what,where,which){
    document.getElementById(where).setAttribute(which,what);
    return this;
  }
  
  this.ReadAttribute=function(where,which){
    return document.getElementById(where).getAttribute(which);
  }
  
  this.CheckAttribute=function(where,which,what){
    var a=this.ReadAttribute(where,which);
    return a.replace(what,"")!=a;
  }
  
  this.Print=function(what,where){
    document.getElementById(where).innerHTML=what;
    return this;
  }
  
  this.PrintImage=function(what,where){
    this.ChangeAttribute(what,where,"src");
    return this;
  };

  this.PrintTileset=function(){
    var code=this.TilesetUnparse(this.Tileset);
    this.Print(code==""?"No tile yet saved..." : code,"PrintedTileset");
    return this;
  };
  
  this.PrintTile=function(){
    var code=this.TileUnparse(this.AskTitle(),this.Matrix);
    this.Print(code,"PrintedTile");
    this.PrintImage(this.MatrixImage(),"DepictedTile");
    return this;
  };
  
  this.Export=function(){
    this.PrintTile();
    this.PrintTileset();
  }
  
  this.ClearBoard=function(){
    var size=this.MatrixSize();
    for(var i=1;i<=size;i++){
      for(var j=1;j<=size;j++){
        this.UpdateTile(i,j,"transparent");
      }
    }
    this.palette.tile=[];
    this.UndoCapture();
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
    this.MatrixColorsCapture();
    return this;
  };
  
  this.ChangeBoardSize=function(){
    this.MatrixResize();
    this.UpdateBoard();
    this.UndoCapture();
    return this;  
  };
  /*** Undo & Redo***/
  
  this.UndoCapture=function(){
    if(this.UndoQueueIndex==this.UndoQueue.length-1){
      this.UndoQueue.push(ArrayCopy(this.Matrix));
      this.UndoQueueIndex++;
    }
    else{
      while(this.UndoQueueIndex<this.UndoQueue.length-1){
        this.UndoQueue.pop();
      }
      this.UndoCapture();
    }
    return this;
  };
  
  this.Undo=function(){
    if(this.UndoQueueIndex>=1){
    this.UndoQueueIndex--
    this.Matrix=ArrayCopy(this.UndoQueue[this.UndoQueueIndex]);
    this.UpdateBoard();
    };
        return this;
  };

   this.Redo=function(){
    if(this.UndoQueueIndex<this.UndoQueue.length-1){
      this.UndoQueueIndex++;
      this.Matrix=ArrayCopy(this.UndoQueue[this.UndoQueueIndex]);
      this.UpdateBoard();
    };
        return this;
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
      this.ClearBoard();

      return this;
    };
  
  this.MatrixLoad=function(matrix){
    this.Matrix=ArrayCopy(matrix);
    this.UpdateBoard();
    this.UndoCapture();
  }
  
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

  this.MatrixParse=function(matrix){
      var text=""
      var colorlist=[];
      var n=ArrayCopy(matrix);
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
      
      if(colorlist.length===1){text=colorlist};//simplified version for unicoloureds
      
    return(text);
    };
    
  this.MatrixUnparse=function(colours,matri){
      var colourlist=colours.replace(/\s$/,"").split(" ");
      var colourmatrix=ReplaceRe(matri," ","");
      var matrix=[[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
      var cp;
      for (var i in matrix){
        for (j in matrix[i]){
        cp=colourmatrix[Number(i)*5+Number(j)];  
        if(cp==="."){
          matrix[i][j]="transparent";
        }
        else{
          matrix[i][j]=colourlist[cp];
        };
      };};
      return matrix;
    };
  /*** Matrix Transformations ***/
    
    this.MatrixFlipHorizontal=function(){
      m=ArrayCopy(this.Matrix);
      for (i in m){m[i].reverse();}
      this.MatrixLoad(m);
      return(this)
    }
    
    this.MatrixFlipVertical=function(){
      m=ArrayCopy(this.Matrix);
      m.reverse();
      this.MatrixLoad(m);
      return(this)
    }
    
    this.MatrixMirrorHorizontal=function(){
      m=ArrayCopy(this.Matrix);
      var l=m[0].length;
      for(var i in m){for(var j in m[i]){m[i][j]=m[i][l-1-j]}}
      this.MatrixLoad(m);
      return(this)
    }
    
    this.MatrixMirrorVertical=function(){
      m=ArrayCopy(this.Matrix);
      var l=m.length;
      for(var i in m){m[i]=m[l-1-i]}
      this.MatrixLoad(m);
      return(this)
    }
  /*** Color functions ***/
  
  HexToRGB=function(fullhex){
  var HexToNumber=function(hex){
    var key=[["A","10"],["B","11"],["C","12"],["D","13"],["E","14"],["F","15"],["a","10"],["b","11"],["c","12"],["d","13"],["e","14"],["f","15"]];
    return Number(ReplaceReLi(hex[0],key))*16+Number(ReplaceReLi(hex[1],key));
    }
  var hex=fullhex.replace("#","");
  var color =[HexToNumber(hex[0]+hex[1]),
    HexToNumber(hex[2]+hex[3]),
    HexToNumber(hex[4]+hex[5])];
  return color;
};
  
  RGBtoHex=function(rgb){
  var NumberToHex=function(n){
    var key=[["10","A"],["11","B"],["12","C"],["13","D"],["14","E"],["15","F"]];
    return ReplaceReLi(String(Math.floor(n/16)),key)+ReplaceReLi(String(n%16),key);
  }
  var r=Math.round(rgb[0]);g=Math.round(rgb[1]);b=Math.round(rgb[2]);
  return "#"+NumberToHex(r)+NumberToHex(g)+NumberToHex(b)
};
  
  RGBtoHSV=function(rgb){
  var r=rgb[0]/255;
  var g=rgb[1]/255;
  var b=rgb[2]/255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
};

  HSVtoRGB=function(hsv){
  var r, g, b;
  var h=hsv[0]; s=hsv[1]; v=hsv[2];

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
};

  Saturate=function(rgbhex,percent){
  var hsv= RGBtoHSV(HexToRGB(rgbhex));
  return RGBtoHex(HSVtoRGB([hsv[0],Math.min(hsv[1]*percent,1),hsv[2]]));
};

  Colorise=function(rgbhex,percent){
  var hsv= RGBtoHSV(HexToRGB(rgbhex));
  return RGBtoHex(HSVtoRGB([Math.min(hsv[0]*percent,255),hsv[1],hsv[2]]));
};

  Brighten=function(rgbhex,percent){
  var hsv= RGBtoHSV(HexToRGB(rgbhex));
  return RGBtoHex(HSVtoRGB([hsv[0],hsv[1],Math.min(hsv[2]*percent,1)]));
};
  /*** Pallettes***/
    this.palette={
      "tile":[],
      "last":[],
      "tileset":[],
      "Colorise":[0.2,0.4,0.6,0.7,0.8,0.9,1.1,1.2],
      "Saturate":[0.2,0.4,0.6,0.8,1.25,1.5],
      "Brighten":[0.2,0.4,0.6,0.8,1.25,1.5],
      "function":function(){return null;}
    };
  
  this.EvalColorFunction=function(target,value){
    return function(color){
      if(color==="transparent"){return "transparent"}else{
      var code=target+"('"+color+"',"+value+")";
      return eval(code);}}};
  
  this.PickColor=function(color){
    this.SetColor(color);
    this.UpdateHSV(color);
    var t=this;
    this.palette["function"]=function(){
      t.MatrixLoad(MatrixMap(t.Matrix,function(x){return(color);}))};
    return this;
  };
  
  this.PickColorFunction=function(target,value){
    var t=this;
    var f=this.EvalColorFunction(target,value);
    this.palette["function"]=function(){
      t.MatrixLoad(MatrixMap(t.Matrix,f));};
    return this;
  };
  
  this.ApplyColorFunction=function(){
    this.palette["function"]();
    return this;
  }

  this.AppendChild=function(id,childhtml){
    var h=document.getElementById(id).innerHTML;
    document.getElementById(id).innerHTML=h+childhtml;
    return this;
  }

  this.UpdateChildren=function(id,childhtml){
    document.getElementById(id).innerHTML=childhtml;
    return this;
  }

  this.UpdateHSV=function(colour){
    var operations=["Colorise","Saturate","Brighten"];
    for(var i in operations){
      var pal = document.getElementById("palette"+operations[i]);
      while (pal.hasChildNodes()) {  
        pal.removeChild(pal.firstChild);
      }
      for(var j in this.palette[operations[i]]){
        this.AppendChild("palette"+operations[i],this.ColorFunctionCardHTML(colour,operations[i],this.palette[operations[i]][j]));
      }
    };
    return this;
  }

  this.ColorSave=function(colour,targetlist){
      if(colour!="transparent"&&this.palette[targetlist].indexOf(colour)===-1){
        this.palette[targetlist].push(colour);
        this.AppendChild("palette"+targetlist,this.ColorCardHTML(colour,targetlist));
      };
      return this;
    };
    
  this.ColorForget=function(colour,targetlist){
      var p=this.palette[targetlist].indexOf(colour);
      if(p!=-1){
        this.palette[targetlist].splice(p,1);
        var item = document.getElementById(targetlist+"-"+colour);
        item.parentNode.removeChild(item);
      };
      return this;
    };

  this.MatrixColorsCapture=function(){
    t=this;
    MatrixMap(this.Matrix,function(x){
      t.ColorSave(x,"tile");
      t.ColorSave(x,"tileset");
    })
    return this;
  };
  
  this.ColorCapture=function(){
    this.ColorSave(this.AskColor(),"last");
    return this;
  }
  
  this.ColorCardHTML=function(color,target){
   return '\
    <div class="card text-center" id="'+target+'-'+color+'">\
      <img class="card-img-top" src="colorplaceholder.png" alt=" " style="height:3rem;background-color:'+color+'" onclick="canvas.PickColor(\''+color+'\')">\
      <div class="card-block">\
        <p class="card-title" style="color:'+color+'">'+color+'</p>\
      </div>\
      <button type="button" class="close" onclick="canvas.ColorForget(\''+color+'\',\''+target+'\')" aria-label="Forget-Color">\
        <span aria-hidden="true">&times;</span>\
      </button>\
    </div>'
  }
  
  this.ColorFunctionCardHTML=function(basecolor,target,pvalue){
    var color=this.EvalColorFunction(target,pvalue)(basecolor);
     return '\
    <div class="card text-center" id="'+target+'-'+pvalue+'-'+color+'">\
       <img class="card-img-top" src="colorplaceholder.png" alt=" " style="height:4rem;background-color:'+color+'" onclick="canvas.PickColorFunction(\''+target+'\',\''+pvalue+'\')">\
      <div class="card-block">\
        <p class="card-title" style="color:'+color+'">'+pvalue+'</p>\
        <p class="card-title" style="color:'+color+'">'+color+'</p>\
      </div>\
    </div>'
  }
  /*** Tile Set**/

  this.Tileset={
    tiles:[],
    names:[],
    selected:[],
    cardshtml:[]
  };

  UniqueName=function(name,names){
    var n=name.replace(/(\d)+$/,"");
    var i=name.replace(n,"");
    if(i===""){ 
      n=n+"2";
    }
    else {
      n=n+String(Number(i)+1);
    };
    while(names.indexOf(n)>=0){
       n=UniqueName(n,names);
    }
     return n;
  };

  this.TilesetAppend=function(matrix,name,src){
    var n=name;
    if(this.Tileset.names.indexOf(name)>=0){ n=UniqueName(name,this.Tileset.names)};
      this.Tileset.tiles.push(matrix);
      this.Tileset.names.push(n);
      this.Tileset.selected.push(false);
      var html=this.TileCardHTML(n,src);
      this.Tileset.cardshtml.push(html);
      this.AppendChild("TileSet",html);
      return this;
  };
  
  this.TilesetImport=function(){
    var data=document.getElementById("TilesetCodeI").value;
        data=this.TilesetParse(data);
    var src;
    for (var i in data){
      src=this.GenerateTileImage(data[i][1]);
      this.TilesetAppend(data[i][1],data[i][0],src);
    }
    return this
  };

  this.GenerateTileImage=function(matrix){
    this.MatrixLoad(matrix);
    var src=this.MatrixImage();
    this.Undo();
    return src;
  }
  
  this.TilesetRemove=function(){
    var l=this.Tileset.selected.length-1;
    for (var i=l;i>=0;i--){
      if(this.Tileset.selected[i]===true){
        this.TileDelete(i);
      }
    }
    return this;
  };
  
  this.TileDelete=function(i){
    this.Tileset.tiles.splice(i,1);
    this.Tileset.names.splice(i,1);
    this.Tileset.selected.splice(i,1);
    this.Tileset.cardshtml.splice(i,1);
    this.UpdateChildren("TileSet",this.Tileset.cardshtml.join())
    return this;
  };
  
  this.TilePositionInSet=function(name){
    var t=true;
    var i=0;
    var o=-1;
    while(t&&i<this.Tileset.names.length){
      if(this.Tileset.names[i]===name){
        o=i;
        t=false;
      }
      i++;
    }
    return o;
  }
  
  this.TileDeleteByName=function(name){
    var i=this.TilePositionInSet(name);
    if(i>=0){this.TileDelete(i)};
    return this;
  }
  
  this.ToggleClass=function(id,classfeature){
    var e=document.getElementById(id);
    var c=e.getAttribute("class");
    d=c.replace(classfeature,"");
    if(c===d){d=c+" "+classfeature}
    e.setAttribute("class",d);
    return this;
  };

  this.TileToggleByName=function(name){
    var i=this.TilePositionInSet(name);
    if(i>=0){
      this.Tileset.selected[i]=!this.Tileset.selected[i];
    };
    this.ToggleClass("tile-"+this.Tileset.names[i],"active");
    return this;
  }

  this.TilesetApply=function(f){
    var l=this.Tileset.selected.length-1;
    for (var i=l;i>=0;i--){
      if(this.Tileset.selected[i]){
        this.Tileset.tiles[i]=f(this.Tileset.tiles[i]);
      }
    }
    return this;
  };
  
  this.TilesetParse=function(code){

    var IsolateObjects=function(code){
      var c=ReplaceReLi(code,[
        [/^((.|\n)+)OBJECTS/,""],//remove above
        [/LEGEND((.|\n)+)/, ""],//remove below
        ["=",""],//remove delimiters
        [/\(((.|\n)+?)\)/,""],//remove comments
        [/((\t|\r|\s)(\t|\r|\s)+)/," "],//remove duplicate whitespace
        [/^((\t|\r|\s|\n)+)/,""],  //remove duplicate whitespace - start 
        [/((\t|\r|\s|\n)+)$/,""],//remove duplicate whitespace - end
        ["\n"," "]//newline to space
      ]);
      return c;
    }

    var NextItemF=function(token){
      return function(code){
        var title = code.match(token)[0];
        return [title,code.replace(token,"")];
      };
    };

    titletoken=/^((?:\w)+)\s/;
    colorstoken=/^((?:(?:transparent)|(?:\#(?:[a-f]|[0-9]){6})|(?:\#(?:[a-f]|[0-9]){3}))(\s|$))+/i;
    blocktoken=/^((?:(?:(?:\.|\d){5})(\s|$)){5})/i;

    var NextTile=function(code){
      var title=code.match(titletoken)[1];
      code=code.replace(titletoken,"");
      var colors=code.match(colorstoken)[0].replace(/\s$/,"");
      code=code.replace(colorstoken,"");
      block=code.match(blocktoken);
      code=code.replace(blocktoken,"");
      (block===null)? block="00000 00000 00000 00000 00000" : block=block[0];
      return [[title,colors,block],code];
    };

    var c=IsolateObjects(code);

    var tileset=[]; var tile;
    while (!(c==="")){
      tile=NextTile(c);
      tileset.push([tile[0][0],this.MatrixUnparse(tile[0][1],tile[0][2])]);
       c=tile[1];
    }
    return tileset
  };

  this.TileSave=function(){
    this.TilesetAppend(ArrayCopy(this.Matrix),this.AskTitle(),this.MatrixImage());
    //Update tilesetcolors
    return this;
  }
    
  this.TileLoad=function(){
    var i=this.Tileset.selected.indexOf(true);
    if(i>=0){
      this.MatrixLoad(this.Tileset.tiles[i]);
      this.TitleLoad(this.Tileset.names[i]);
    }
    return this;
  }

  this.TileCardHTML=function(name,src){
    return '\
    <div class="card text-center btn btn-secondary" id="tile-'+name+'">\
      <img class="card-img-top" src="'+src+'" style="height:50px" onclick="canvas.TileToggleByName(\''+name+'\')">\
      <div class="card-block">\
        <p class="card-title">'+name+'</p>\
      </div>\
      <button type="button" class="close" onclick="canvas.TileDeleteByName(\''+name+'\')" aria-label="Forget-Tile">\
        <span aria-hidden="true">&times;</span>\
      </button>\
    </div>'
  };

  this.MatrixImage=function() {
	  var imagedata = c.toDataURL();
	  return imagedata;
  }

  this.MatrixReset();}

var canvas=new Canvas("TileEditor");

