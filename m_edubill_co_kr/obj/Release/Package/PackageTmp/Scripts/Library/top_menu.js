$(function(){
    $(".menu_wrap").css({
        "display":"none"
    });
    
    $(".menu_box").css({ 
        "z-index":"9999"
    });
    
    $(".menu_btn").click(function(){        
        $(".menu_wrap").show();
        $(".dummy_box").show();
    });
    
    $(".close_btn,.dummy_box,.menu_out").click(function(){
        $(".menu_wrap").hide();
        $(".dummy_box").hide();
    });
    
    $(window).on("resize",function(){
        _dummybox();            
    });
    _dummybox();    
    _thumbPop();
    _cartPricewrap();
     //_textAreafocus();
//     contHold();
});
function _dummybox(){
     var _HBheight = $("html,body").height();
    $(".dummy_box").css({
        "height" : _HBheight
    });
};


function _thumbPop(){
    $(".ui-listview .ThumbnailPath").on("click",function(){        
        var _cloneImg = $(this).clone();
        $(".pop_thumb").append(_cloneImg);
        $(".pop_thumb").show();
        $(".dummy_box").show();
    });
    $(".pop_thumb, .dummy_box").on("click", function(){
        $(".dummy_box").hide();
        $(".pop_thumb").children().remove();
        $(".pop_thumb").hide();
    });
}


function _cartPricewrap() {
     $(".down_btn").on("click",function(){        
        if($(".price_wrap").css("bottom") == "44px" ){
            $(".price_wrap").stop().animate({
                "bottom": "-50px"
            });
            var _replImg = $(".down_btn img").attr("src");
            _replImg = _replImg.replace("down","up");
            $(".down_btn img").attr("src",_replImg);
        }else{
            $(".price_wrap").stop().animate({
                "bottom": "44px"
            });
            var _replImg = $(".down_btn img").attr("src");
            _replImg = _replImg.replace("up","down");
            $(".down_btn img").attr("src",_replImg);
        }
    });    
}

function _textAreafocus(){
    var _basicText = $(".ui-input-text").text();
    $(".ui-input-text").on({
        focusin : function(){
              $(this).text("");
        },focusout : function(){
              $(this).text(_basicText);
        }
    }); 
}


function contHold() {
    $("#Products .ui-listview li:even").css("background","#fef8ed");
}