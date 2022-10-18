$(function () {
    TryAllowOrder();
    CalculateSum();
    InitDatePicker();
});

function TryAllowOrder() {
    $.ajax({
        url: AllowOrderByTimeUrl,
        type: 'POST',
        contentType: "application/json",
        success: function (r) {
            if (r.IsAllowed) {
                $.ajax({
                    url: AllowOrderByWeekUrl,
                    type: 'POST',
                    contentType: "application/json",
                    success: function (r) {
                        if (r.IsAllowed) {
                            $.ajax({
                                url: AllowOrderByMisuUrl,
                                type: 'POST',
                                contentType: "application/json",
                                success: function (r) {
                                    if (r.IsAllowed) {
                                        $('#aConfirmOrder').addClass('alloworder')
                                    }
                                    else {
                                        $('#aConfirmOrder').addClass('ui-disabled')
                                    }
                                },
                                error: function () {
                                    //$('#aConfirmOrder').addClass('ui-disabled')
                                }
                            });
                        }
                        else {
                            $('#aConfirmOrder').addClass('ui-disabled')
                        }
                    },
                    error: function () {
                        //$('#aConfirmOrder').addClass('ui-disabled')
                    }
                });
            }
            else {
                $('#aConfirmOrder').addClass('ui-disabled')
            }
        },
        error: function () {
            //$('#aConfirmOrder').addClass('ui-disabled')
        },
    });
}

function UpdateItem() {
    $PreCount = parseInt($(event.target).parents('.cart-product-count').data('count'));
    $Count = $(event.target).val();
    if($Count == '')
      $Count = 0;
    if ($Count < 0)
    {
        $(event.target).val($PreCount);
        return;
    }
    $CartId = $(event.target).parents('li').data('cartid');
    $.ajax(
        {
            url: UpdateItemUrl,
            type: 'POST',
            data: { CartId: $CartId, Count: $Count },
            success: function (r) {
                if (r.toLowerCase() == 'true') {
                    CalculateSum();
                }
                else {
                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                    $(event.target).val($PreCount);
                }
            },
            error: function () {
                $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                $(event.target).val($PreCount);
            }

        });
}

function CalculateSum() {
    var $Count = 0;
    var $Sum = 0;
    var $Inputs = $('#CartItems .cart-product-count input');
    var $vatflag = $('.data-vatflag').data('value');


    //$.Dialog.MessageBox($vatflag);


    $Inputs.each(function (index, element) {
        $v = parseInt($(element).val());
        if (isNaN($v))
            $v = 0;
        if ($v < 0) {
            $(element).val('');
            $v = 0;
        }
        $(element).parents('.cart-product-count').data('count', $v);
    });
    var $ProductCounts = $('#CartItems .cart-product-count');
    $ProductCounts.each(function (index, element) {
        var $count = parseInt($(element).data('count'));
        var $price = parseInt($(element).data('price'));
        var $hasTax = $(element).data('hastax').toLowerCase() == 'true';
        var $tax = 0
        var $amt = 0
        if ($vatflag == "y") {

            if ($hasTax) {
                $tax = Math.round($count * $price / 11);
            }
            $amt = $count * $price - $tax;
        }
        else if ($vatflag == "n") {

            if ($hasTax) {
                $tax = Math.round($count * $price * 0.1);
            }
            $amt = $count * $price ;
        }
        else {
          
            $tax = 0;
           
            $amt = $count * $price;
        }

        $(element).parents('li').find('.ProductAmt').html('[공급가]' + $amt.formatMoney(0) + '원');
        $(element).parents('li').find('.ProductTax').html('[세액]' + $tax.formatMoney(0) + '원');
        $Count += $count;
        if ($vatflag == "n") {
            $Sum += $count * $price + $tax;
        }
        else {
            $Sum += $count * $price;
        }
      
    });
    $('#SumViewer_Value').html($Sum.formatMoney(0) + '원');
   
   
    $('#OrderAmt').val($Sum);
    if (parseInt($('#OrderAmt').val()) > parseInt($('#Current').val())) {
        //$('#aConfirmOrder').addClass('ui-disabled');
    }
    else {
        //if ($('#aConfirmOrder').hasClass('alloworder'))
        //    $('#aConfirmOrder').removeClass('ui-disabled');
    }
}

function GoOrder() {
    //var $CartItems = [];
    //$('#CartItems .cart-product-count').each(function (index, element) {
    //    var $Count = parseInt($(element).data('count'));
    //    var $Code = $(element).data('code');
    //    var $Price = parseInt($(element).data('price'));
    //    $CartItems.push(
    //        {
    //            ProductCode: $Code,
    //            ProductPrice: $Price,
    //            Count: $Count
    //        });
    //});
    //if ($CartItems.length == 0)
    //{
    //    window.location.href = OrderUrl;
    //    return;
    //}
    //$.ajax({
    //    url: AddCartItemsUrl,
    //    type: 'POST',
    //    data: { CartItems: $CartItems },
    //    success: function (r) {
    //        if (r.toLowerCase() == 'true') {
    //            window.location.href = OrderUrl;
    //        }
    //        else {
    //            $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
    //        }
    //    },
    //    error: function () {
    //        $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
    //    }
    //});
    window.location.href = OrderUrl;
}

function ClearCart() {
    $.Dialog.QuestionBox('장바구니 비우기', '장바구니를 비우시겠습니까?',
    {
        Text: '예',
        Method: function () {
            $.Dialog.Close();
            $.ajax({
                url: ClearCartUrl,
                type: 'POST',
                success: function (r) {
                    if (r.toLowerCase() == 'true') {
                        window.location.href = OrderUrl;
                    }
                    else {
                        $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                    }
                },
                error: function () {
                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                }
            });
        }
    },
    {
        Text: '아니오',
        Method: function () {
            $.Dialog.Close();
        }
    });
}

function ConfirmOrder() {
    //var $Sum = 0;
    //var $ProductCounts = $('#CartItems .cart-product-count');
    //$ProductCounts.each(function (index, element) {


    //    var $count = parseInt($(element).data('count'));
    //    var $price = parseInt($(element).data('price'));

    //    //추가해야함
    //    $Sum += $count * $price;


    //});
   
    var $Sum = 0;
    var $ProductCounts = $('#CartItems .cart-product-count');

    var $vatflag = $('.data-vatflag').data('value');


   // $.Dialog.MessageBox($vatflag);

  //  var $Sum = 0;
  //  var $ProductCounts = $('#CartItems .cart-product-count');
    var $tax = 0
    var $amt = 0
    $ProductCounts.each(function (index, element) {


        var $count = parseInt($(element).data('count'));
        var $price = parseInt($(element).data('price'));


        var $hasTax = $(element).data('hastax').toLowerCase() == 'true';


       
        if ($vatflag == "y") {

            if ($hasTax) {
                $tax = Math.round($count * $price / 11);
            }
           // $amt = $count * $price - $tax;
        }
        else if ($vatflag == "n") {

            if ($hasTax) {
                $tax = Math.round($count * $price * 0.1);
            }
            else {
                $tax = 0;
            }
          //  $amt = $count * $price;
        }
        else {

            $tax = 0;

          //  $amt = $count * $price;
        }


        //$Count += $count;
        if ($vatflag == "n") {
            $Sum += $count * $price + $tax;
        }
        else {
            $Sum += $count * $price;
        }

        ////추가해야함
       // $Sum += $count * $price;


    });
 
 //   $.Dialog.MessageBox($Sum);

    var $myflag = $('.data-myflag').data('value');
    var $myflag_select = $('.myflag_select').data('value');
    var $wdate = $('#wdate').val();
    var $Now = $('#Now').val();
  
   // $.Dialog.MessageBox($wdate);
  //  $.Dialog.MessageBox($Now);
    if ($wdate != $Now) {
        $.Dialog.NavigationBox('확인', '주문일자와 장바구니에 담은 일자가 달라서 주문 할 수 없습니다.<br>주문 내역을 다시 입력 바랍니다.</br>(장바구니 내역은 삭제됩니다.)',
    {
        Text: '확인',
        Method: function () {
            $.Dialog.Close();
            $.ajax({
                url: ClearCartUrl,
                type: 'POST',
                success: function (r) {
                    if (r.toLowerCase() == 'true') {
                        window.location.href = OrderUrl;
                    }
                    else {
                        $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                    }
                },
                error: function () {
                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                }
            });
        }
    }
    //{
    //    Text: '아니오',
    //    Method: function () {
    //        $.Dialog.Close();
    //    }
    //}

    );
    }
    if ($myflag == 'y') {

        if ($myflag_select == '2') {
            if (parseInt($('#OrderAmt').val()) > parseInt($('#Current').val())) {
                var $Yeosin = $('.data-Yeosin').data('value');
                var $Misu = $('.data-Misu').data('value');
                var $Current = $('.data-Current').data('value');



                $.Dialog.MessageBox('주문 차단', '<font style="color :Blue; font-weight:bold">[당일주문] 금액이 [주문가능] 금액을 초과하여 주문 할 수 없습니다.</font><br><br>여신금액 : ' + $Yeosin + '<br>미수금액 : ' + $Misu + '<br>주문가능금액 : ' + $Current + '<br>당일주문금액 : ' + $Sum.formatMoney(0) + '원');
                return;
            }
        }
        
    }

   // var $Current = $('#SumViewer_Value').data('value');
  //  $.Dialog.MessageBox($Sum);
    $.Dialog.QuestionBox('주문 확인', '장바구니 상품을 주문 하시겠습니까?<br>주문금액 : ' + $Sum.formatMoney(0) + '원',
    {
        Text: '예',
        Method: function () {
            $.Dialog.Close();
            var $Comment = $('#Comment textarea').val();
            var $requestday = $('#From').val();
       
           
            $.ajax({
                url: ConfirmOrderUrl,
                type: 'POST',
                data: { Comment: $Comment, request_day: $requestday },
                success: function (r) {
                    if (r.IsSuccess) {
                        $.Dialog.NavigationBox('주문 확인', '주문이 완료 되었습니다.', {
                            Text: '확인', Method: function () {
                                window.location.href = HomeUrl;
                            }
                        });
                    }
                    else {
                        $.Dialog.MessageBox('주문 확인', r.Error);
                    }
                },
                error: function () {
                    $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
                }
            });
        }
    },
    {
        Text: '아니오',
        Method: function () {
            $.Dialog.Close();
        }
    });
}



function InitDatePicker() {
    $(".ui-input-date").attr('readonly', 'readonly');
    $(".ui-input-time").attr('readonly', 'readonly');

    $(".ui-input-date").click(function (event) {
        $(event.target).datebox('open');
    });

    $(".ui-input-time").click(function (event) {
        $(event.target).datebox('open');
    });

    $(".ui-input-date").datebox({ mode: 'flipbox', useNewStyle: true });
    $(".ui-input-time").datebox({ mode: 'timeflipbox', useNewStyle: true });

}