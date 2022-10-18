$(function () {
    InitAllowEdit();
    CalculateSum();
    InitDatePicker();
});

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
function InitAllowEdit() {
    if ($('#AllowEdit').val().toLowerCase() == 'true') {
        $('#CartItems input').prop('readonly', false);
    }
    else {
        $('#CartItems input').prop('readonly', true).addClass('ui-disabled');
        $('.input-edit').addClass('ui-disabled');
    }
}
function CalculateSum() {
    var $Sum = 0;
    var $Inputs = $('#CartItems .cart-product-count input');

    var $vatflag = $('.data-vatflag').data('value');
  //  $.Dialog.MessageBox(vatflag);
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
        //if ($hasTax) {
        //    $tax = Math.round($count * $price / 11);
        //}
        //var $amt = $count * $price - $tax;

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
            $amt = $count * $price;
        }
        else {

            $tax = 0;

            $amt = $count * $price;
        }


        $(element).parents('li').find('.ProductAmt').html('[공급가]' + $amt.formatMoney(0) + '원');
        $(element).parents('li').find('.ProductTax').html('[세액]' + $tax.formatMoney(0) + '원');

        if ($vatflag == "n") {
            $Sum += $count * $price + $tax;
        }
        else {
            $Sum += $count * $price;
        }
      //  $Sum += $count * $price;
    });


    $('#OrderAmt').html($Sum.formatMoney(0) + ' 원');
}
function CancelOrder() {
    $.Dialog.QuestionBox('주문취소', '주문을 취소 하시겠습니까?',
    {
        Text: '예',
        Method: function () {
            $.Dialog.Close();
            $.ajax({
                url: CancelUrl,
                type: 'POST',
                data: { OrderId: $('#OrderId').val() },
                success: function (r) {
                    if (r.toLowerCase() == 'true') {
                        window.location.href = OrderListUrl;
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
function UpdateOrder() {
    var $Sum = 0;
    var $ProductCounts = $('.cart-product-count');

    var $vatflag = $('.data-vatflag').data('value');
    var $tax = 0
    var $amt = 0

  //  $.Dialog.MessageBox($vatflag);

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
    });


    var $myflag = $('.data-myflag').data('value');
    var $myflag_select = $('.data-myflag_select').data('value');
  //  var $myflag = parseInt($(element).data('myflag'));
  ////  var $myflag = $('.myflag').data('value');
  //  $.Dialog.MessageBox($myflag_select);

    if ($myflag == 'y') {

        if ($myflag_select == '2') {
            if ($Sum > parseInt($('#Current').val())) {
                var $Yeosin = parseInt($('#Yeosin').val());
                var $Misu = parseInt($('#Misu').val());
                var $Current = parseInt($('#Current').val());
                $.Dialog.MessageBox('주문 차단', '<font style="color :Blue; font-weight:bold">[당일주문] 금액이 [주문가능] 금액을 초과하여 수정할 수 없습니다.</font><br><br>여신금액 : ' + $Yeosin.formatMoney(0) + '<br>미수금액 : ' + $Misu.formatMoney(0) + '<br>주문가능금액 : ' + $Current.formatMoney(0) + '<br>당일주문금액 : ' + $Sum.formatMoney(0) + '원');
                return;
            }
        }

    }
   // $.Dialog.MessageBox($myflag_select);
    $.Dialog.QuestionBox('주문수정', '주문을 수정 하시겠습니까?',
    {
        Text: '예',
        Method: function () {
            $.Dialog.Close();
            var $CartItems = [];
            $('#CartItems .cart-product-count').each(function (index, element) {
                var $Id = parseInt($(element).data('cartid'));
                var $Count = parseInt($(element).data('count'));
                var $price = parseInt($(element).data('price'));
                var $vatflag = $('.data-vatflag').data('value');
               
                var $hasTax = $(element).data('hastax').toLowerCase() == 'true';
                var $Tax = 0
                var $NewTax = 0

                var $NewAmt = 0;
               

                if ($hasTax) {
                    $Tax = Math.round($Count * $price / 11);
                }
                var $Amt = $Count * $price - $Tax;

               

                if ($vatflag == "y") {

                    if ($hasTax) {
                        $NewTax = Math.round($Count * $price / 11);
                    }
                    $NewAmt = $Count * $price - $NewTax;
                }
                else if ($vatflag == "n") {

                    if ($hasTax) {
                        $NewTax = Math.round($Count * $price * 0.1);
                    }
                    else {
                        $NewTax = 0;
                    }
                    $NewAmt = $Count * $price;
                }
                else {

                    $NewTax = 0;

                    $NewAmt = $Count * $price;
                }
               
             //   $.Dialog.MessageBox($NewTax);
               
            



               
                $CartItems.push({ Id: $Id, Count: $Count, Tax: $Tax, Amt: $Amt, NewTax: $NewTax, NewAmt: $NewAmt });
            });
           


            $.ajax({
                url: UpdatetUrl,
                type: 'POST',
                data: JSON.stringify( { OrderId: $('#OrderId').val(), CartItems: $CartItems ,  request_day : $('#From').val()}),
                contentType: "application/json",
                success: function (r) {
                    if (r.toLowerCase() == 'true') {
                        window.location.href = OrderListUrl;
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
