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


        $(element).parents('li').find('.ProductAmt').html('[?????????]' + $amt.formatMoney(0) + '???');
        $(element).parents('li').find('.ProductTax').html('[??????]' + $tax.formatMoney(0) + '???');

        if ($vatflag == "n") {
            $Sum += $count * $price + $tax;
        }
        else {
            $Sum += $count * $price;
        }
      //  $Sum += $count * $price;
    });


    $('#OrderAmt').html($Sum.formatMoney(0) + ' ???');
}
function CancelOrder() {
    $.Dialog.QuestionBox('????????????', '????????? ?????? ???????????????????',
    {
        Text: '???',
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
                        $.Dialog.Alert('?????????????????????. ?????? ?????????????????????.');
                    }
                },
                error: function () {
                    $.Dialog.Alert('?????????????????????. ?????? ?????????????????????.');
                }
            });
        }
    },
    {
        Text: '?????????',
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
                $.Dialog.MessageBox('?????? ??????', '<font style="color :Blue; font-weight:bold">[????????????] ????????? [????????????] ????????? ???????????? ????????? ??? ????????????.</font><br><br>???????????? : ' + $Yeosin.formatMoney(0) + '<br>???????????? : ' + $Misu.formatMoney(0) + '<br>?????????????????? : ' + $Current.formatMoney(0) + '<br>?????????????????? : ' + $Sum.formatMoney(0) + '???');
                return;
            }
        }

    }
   // $.Dialog.MessageBox($myflag_select);
    $.Dialog.QuestionBox('????????????', '????????? ?????? ???????????????????',
    {
        Text: '???',
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
                        $.Dialog.Alert('?????????????????????. ?????? ?????????????????????.');
                    }
                },
                error: function () {
                    $.Dialog.Alert('?????????????????????. ?????? ?????????????????????.');
                }
            });
        }
    },
    {
        Text: '?????????',
        Method: function () {
            $.Dialog.Close();
        }
    });
}
