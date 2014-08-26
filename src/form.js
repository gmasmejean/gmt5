

var form = function( form ){
   this.element = form;
   this.name = '';
};

form.prototype = {
    init:function(){},
    get:function(){},
    valid:function(){},
    
    
    add:function(){},
    remove:function(){}
};


form.prototype.element = function( form, dom){ this.form=form; this.dom=dom;},
form.prototype.element.prototype={
    valid:function(){},
};


form.prototype.input = function(){};
form.prototype.input.prototype = {
    reset:function(){},
    valid:function(){},
    value:function(){}
};