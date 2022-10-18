var IsLoaded = false;
var offKeyboardHeight = 0;
$(function () {
    MakeProductGroupsScroller();
    TryAllowOrderByTime();
GoCart2();
    $('.ui-li-count input').val('');
    CalculateSum();
    $('#ProductGroups_Viewer li a')[0].click();
    offKeyboardHeight = $(window).height();
    $(window).resize(function () {
        if ($(window).height() >= offKeyboardHeight)
        {
            $(':focus').blur();
            ProductFilter();
            //if ($('#Products li.CurrentInput').length > 0) {
            //    window.scrollTo(0, $('#Products li.CurrentInput').position().top);
            //}
        }
    });
    IsLoaded = true;
});

function GoCart2() {
    $.ajax({
        url: HasCartUrl,
        type: 'POST',
        success: function (r) {
            if (r.toLowerCase() == 'true') {
              //  window.location.href = CartUrl;
            }
            else {
                $('.btn_2').addClass('ui-disabled');
               // $.Dialog.Alert('장바구니에 상품이 없습니다.');
            }
        },
        
    });
}



function MakeProductGroupsScroller() {
    var LnbScrollManager = jindo.$Class({
        $init: function (g) {
            var d = jindo.$Element(g);
            if (!d) {
                return
            } var a = d.query(".scroller");
            if (!a) {
                return
            } var f = new jindo.m.Scroll(d, { bAutoResize: false, bUseHScroll: true, bUseVScroll: false, bUseScrollbar: false, bUseCss3d: this._useCss3dPatch(), nHeight: a.height() });
            function i() {
                var j = a.query("li.on");
                if (j) {
                    var k = j.parent().offset().left - j.offset().left;
                    k += parseInt((window.innerWidth - j.width()) / 2, 10);
                    f.scrollTo(Math.min(0, k), 0)
                }
            } jindo.m.bindRotate(function () {
                f.refresh();
                i()
            });
            var h = this;
            var b = d.parent();
            var c = b.query(".grd_prev"), e = b.query(".grd_next");
            if (c && e) {
                f.attach({
                    afterScroll: function (j) {
                        if (h._useGradientDimLayer()) {
                            c.visible(j.nLeft < 0, "block");
                            e.visible(j.nLeft > j.nMaxScrollLeft, "block")
                        }
                    }, scroll: function (j) {
                        var k = (j.nDistanceX < 0) ? "lnb.flne" : "lnb.flpr";
                        nclk(this, k, "", "")
                    }
                })
            } jindo.$Fn(i).delay(0)
        }, _useGradientDimLayer: function () {
            var b = jindo.m.getDeviceInfo();
            var a = jindo.$Agent();
            var c = false;
            c = (a.os().ios && parseFloat(b.version, 10) > 6) ? true : c;
            c = (b.android && parseFloat(b.version, 10) >= 4) ? true : c;
            return c
        }, _useCss3dPatch: function () {
            var a = jindo.m.getDeviceInfo();
            return (a.android && parseFloat(a.version, 10) === 4) ? false : jindo.m.useCss3d(true)
        }
    });
    var mLnbScrollManager = new LnbScrollManager('ProductGroups_Viewer');
}

function CalculateSum() {
    var $Count = 0;
    var $Sum = 0;
    var $Inputs = $('#Products .order-product-count input');

    var $vatflag = $('.data-vatflag').data('value');


 //   $.Dialog.MessageBox($vatflag);



    $Inputs.each(function (index, element) {
        $v = parseInt($(element).val());
        if (isNaN($v))
            $v = 0;
        if ($v < 0)
        {
            $(element).val('');
            $v = 0;
        }
        $(element).parents('.order-product-count').data('count', $v);
    });
    var $ProductCounts = $('#Products .order-product-count');
    $ProductCounts.each(function (index, element) {
        var $count = parseInt($(element).data('count'));
        var $price = parseInt($(element).data('price'));
        $Count += $count;
        $Sum += $count * $price;



    
        //if ($vatflag == "y") {

        //    if ($hasTax) {
        //        $tax = Math.round($count * $price / 11);
        //    }
        //    $amt = $count * $price - $tax;
        //}
        //else if ($vatflag == "n") {

        //    if ($hasTax) {
        //        $tax = Math.round($count * $price * 0.1);
        //    }
        //    $amt = $count * $price;
        //}
        //else {

        //    $tax = 0;

        //    $amt = $count * $price;
        //}


        //$Count += $count;
        //if ($vatflag == "n") {
        //    $Sum += $count * $price + $tax;
        //}
        //else {
        //    $Sum += $count * $price;
        //}
      
    });
    $('#SumViewer_Value').html('주문금액 : ' + $Sum.formatMoney(0));
}

function ProductGroupSelect() {
    $('#ProductGroups li').removeClass('on');
    $(event.target).parent('li').addClass('on');
    ProductFilter();
}

function ProductFilter() {
    var $groupcode = $('#ProductGroups li.on').data('groupcode');
    var $filter = $('#FilterInput').val().trim();
    var seq = 1;
    $('#Products li').each(function (index, element) {
        $(element).css("background","");
        var $productcode = $(element).data('productcode').toString();
        var $productname = $(element).data('productname');
        var $productunit = $(element).data('productunit');
        if ($groupcode == "All") {
            if($productcode.indexOf($filter) > -1 || $productname.indexOf($filter) > -1 || $productunit.indexOf($filter) > -1)
            {
                $(element).show();
                $(element).find('.ProductSeq').html('[' + seq + ']');
                if(seq % 2 == 0)
                  $(element).css("background","#fef8ed");
                seq++;
            }
            else {
                $(element).hide();
            }
        }
        else {
            if ($(element).data('groupcode') == $groupcode) {
                if ($productcode.indexOf($filter) > -1 || $productname.indexOf($filter) > -1 || $productunit.indexOf($filter) > -1) {
                    $(element).show();
                    $(element).find('.ProductSeq').html('[' + seq + ']');
                    if(seq % 2 == 0)
                      $(element).css("background","#fef8ed");
                    seq++;
                }
                else {
                    $(element).hide();
                }
            }
            else {
                $(element).hide();
            }
        }
    });
    //window.scrollTo(0, 0);
}

function Sort_Input_Select() {
    $('#Sort_Input a').removeClass('on');
    $(event.target).addClass('on');
    ProductSort();
}

function ProductSort() {
    var $Array = [];
    var $sortType = $('#Sort_Input a.on').data('type');
    if ($sortType == 'Code') {
        $('#Products li').each(function (index, element)
        {
            $Array.push(
                {
                    afilter: $(element).data('productcode'),
                    html: $(element)
                });
        });
        $Array = $Array.sort(function (v1, v2) {
            return ((v1.afilter < v2.afilter) ? -1 : ((v1.afilter > v2.afilter) ? 1 : 0));

        });
    }
    else if ($sortType == 'Name') {
        $('#Products li').each(function (index, element) {
            $Array.push(
                {
                    afilter: $(element).data('productname'),
                    html: $(element)
                });
        });
        $Array = $Array.sort(function (v1, v2) {
            return v1.afilter.localeCompare(v2.afilter);
        });
    }
    window.scrollTo(0, 0);
    $('#Products ul').html('');

    for (var i = 0; i < $Array.length ; i++) {
        $('#Products ul').append($($Array[i].html));
    }

    $('#Products ul').listview().listview('refresh');
	_thumbPop();
}

function InputReady() {
    if (!IsLoaded)
        return;
    var index = $(event.target).parents('li').index();
    if (index > 2)
    {
        window.scrollTo(0, $(event.target).parents('ul').children('li').eq(index - 2).position().top);
    }
    else {
        window.scrollTo(0, $(event.target).parents('ul').position().top);
    }
    //if (!IsLoaded)
    //    return;
    //$('#Products li').hide();
    //$(event.target).parents('li').show();
    //$('#Products li').removeClass('CurrentInput');
    //$(event.target).parents('li').addClass('CurrentInput');
    ////window.scrollTo(0, $(event.target).parents('li').position().top);
}
//function InputDone() {
//    $('#Products li').removeClass('CurrentInput');
//}

function AddCartItems() {
    var $CartItems = [];
    $('#Products .order-product-count').each(function (index, element) {
        var $Count = parseInt($(element).data('count'));
        if ($Count > 0) {
            var $Code = $(element).data('code');
            var $Price = parseInt($(element).data('price'));
            $CartItems.push(
                {
                    ProductCode: $Code,
                    ProductPrice: $Price,
                    Count: $Count
                });
        }
    });
    if ($CartItems.length == 0)
    {
        $.Dialog.Alert('선택된 상품이 없습니다.');
        return;
    }

    $.ajax({
        url: AddCartItemsUrl,
        type: 'POST',
        data: JSON.stringify({ CartItems: $CartItems }),
        contentType: "application/json",
        success: function (r) {
            if (r.toLowerCase() == 'true') {
                $.Dialog.QuestionBox('장바구니 담기', $CartItems.length + '건을 장바구니에 담았습니다.',
                    {
                        Text: '추가주문',
                        Method: function () {
                            window.location.reload();
                        },
                    },
                    {
                        Text: '장바구니 보기',
                        Method: function () {
                            GoCart();
                        },
                    });
            }
            else {
                $.Dialog.Alert('주문내역 저장에 실패하였습니다.<br>다시 로그인 한 후, 주문하여 주십시오.');
            }
        },
        error: function () {
 
            $.Dialog.Alert('주문내역 저장에 실패하였습니다.<br>다시 로그인 한 후, 주문하여 주십시오.');
        }
    });



    //$.Dialog.QuestionBox('장바구니 담기', '장바구니에 ' + $CartItems.length + '건을 추가로 담겠습니까?',
    //    {
    //        Text: '예',
    //        Method: function () {
    //            $.Dialog.Close();
    //            $.ajax({
    //                url: AddCartItemsUrl,
    //                type: 'POST',
    //                data: { CartItems: $CartItems },
    //                success: function (r) {
    //                    if (r.toLowerCase() == 'true') {
    //                        $.Dialog.QuestionBox('장바구니 담기', $CartItems.length + '건을 장바구니에 담았습니다.',
    //                            {
    //                                Text: '추가주문',
    //                                Method: function () {
    //                                    window.location.reload();
    //                                },
    //                            },
    //                            {
    //                                Text: '장바구니 보기',
    //                                Method: function () {
    //                                    GoCart();
    //                                },
    //                            });
    //                        //$('#Products .order-product-count input').val(0);
    //                        //CalculateSum();
    //                    }
    //                    else {
    //                        $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
    //                    }
    //                },
    //                error: function () {
    //                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
    //                }
    //            });
    //        }
    //    },
    //    {
    //        Text: '아니오',
    //        Method: function () {
    //            $.Dialog.Close();
    //        }
    //    });
}

function GoCart() {
    $.ajax({
        url: HasCartUrl,
        type: 'POST',
        success: function (r) {
            if (r.toLowerCase() == 'true') {
                window.location.href = CartUrl;
            }
            else {
$('.btn_2').addClass('ui-disabled');
                $.Dialog.Alert('장바구니에 상품이 없습니다.');
            }
        },
        error: function () {
            $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
        }
    });
}

function TryAllowOrderByTime() {
    $.ajax({
        url: AllowOrderByTimeUrl,
        type: 'POST',
        contentType: "application/json",
        success: function (r) {
            if (r.IsAllowed) {
                TryAllowOrderByWeek();
            }
            else {
                var $Message = '지금은 주문허용 시간이 아니므로 주문을 하실수 없습니다.' + '<br><br>' + r.Message;
                var $LeftButton =
                    {
                        Text: '돌아가기',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                            window.location.href = HomeUrl;
                        }
                    };
                var $RightButton =
                    {
                        Text: '계속',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                            TryAllowOrderByWeek();
                        }
                    };
                $.Dialog.QuestionBox('주문 차단시간', $Message, $LeftButton, $RightButton);
            }
        },
        error: function () {
            $.Dialog.Alert('실패하였습니다. 시작으로 돌아갑니다');
            window.location.href = HomeUrl;
        }
    });
}
function TryAllowOrderByWeek() {
    $.ajax({
        url: AllowOrderByWeekUrl,
        type: 'POST',
        success: function (r) {
            if (r.IsAllowed) {
                TryAllowOrderByMisu();
            }
            else {
                var $Message = '지금은 주문허용 시간이 아니므로 주문을 하실수 없습니다.' + '<br><br>' + r.Message;
                var $LeftButton =
                    {
                        Text: '돌아가기',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                            window.location.href = HomeUrl;
                        }
                    };
                var $RightButton =
                    {
                        Text: '계속',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                            TryAllowOrderByMisu();
                        }
                    };
                $.Dialog.QuestionBox('주문 허용시간', $Message, $LeftButton, $RightButton);
            }
        },
        error: function () {
            $.Dialog.Alert('실패하였습니다. 시작으로 돌아갑니다');
            window.location.href = HomeUrl;
        }
    });
}
function TryAllowOrderByMisu() {
    $.ajax({
        url: AllowOrderByMisuUrl,
        type: 'POST',
        success: function (r) {
            if (r.IsAllowed) {
            }
            else {
                var $Message = '미수금이 여신금을 초과하여 주문을 하실 수 없습니다. (지정 계좌로 입금 후 주문 바랍니다.)' + '<br><br>' + r.Message + '<br>' + '내 정보에서 계좌번호를 확인 바랍니다.';
                var $LeftButton =
                    {
                        Text: '돌아가기',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                            window.location.href = HomeUrl;
                        }
                    };
                var $RightButton =
                    {
                        Text: '계속',
                        Method: function () {
                            $('#AlertDialog').popup('close');
                        }
                    };
                $.Dialog.QuestionBox('주문 차단', $Message, $LeftButton, $RightButton);
            }
        },
        error: function () {
            $.Dialog.Alert('실패하였습니다. 시작으로 돌아갑니다');
            window.location.href = HomeUrl;
        }
    });
}