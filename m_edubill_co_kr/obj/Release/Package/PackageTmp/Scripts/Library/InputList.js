$(function () {
    LoadItem();
    InitDatePicker();
   // LoadCyberNum();
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

function LoadItem() {
    var $cyberNum = $('.data-cyberNum').data('value');


    // $.Dialog.MessageBox($cyberNum);
    if ($cyberNum == 'n') {
        $.Dialog.Alert('위 체인점에서 입금하신 계좌번호는 가상계좌가 아니므로 여기 입금내역에는 표시되지 않습니다.</br> 체인본사로 문의 바랍니다.');
        return;
    }

    else {
        $.ajax(
        {
            url: ItemsUrl,
            type: 'POST',
            data: { From: $('#From').val(), To: $('#To').val() },
            success: function (r) {
                $('#Items').html(r);
                $('#Items ul').listview().listview('refresh');
                $('#Items li:odd').addClass('odd');
                $('#Items li:even').addClass('even');
                $('.field-gubun').each(function (index, element) {
                    if ($(element).html() == '허용') {
                        $(element).addClass('colorBlue');
                    }
                    if ($(element).html() == '차단') {
                        $(element).addClass('colorRed');
                    }
                });
            },
            error: function () {
                $.Dialog.Alert('실패하였습니다. 다시 시도해주십시오.');
            }
        });
    }
}
function ToggleBox() {
    if ($('#bToggleBox').hasClass('ui-alt-icon')) {
        $('#bToggleBox').removeClass('ui-alt-icon');
        $('.ui-box').hide();
    }
    else {
        $('#bToggleBox').addClass('ui-alt-icon')
        $('.ui-box').show();
    }
}


function LoadCyberNum() {
  

    var $cyberNum = $('.data-cyberNum').data('value');
 

   // $.Dialog.MessageBox($cyberNum);
    if ($cyberNum == 'n') {
        $.Dialog.Alert('위 체인점에서 입금하신 계좌번호는 가상계좌가 아니므로 여기 입금내역에는 표시되지 않습니다.</br> 체인본사로 문의 바랍니다.');
      
    }

   
    
}