$(function () {
    InitDatePicker();
    LoadItems();
});
function InitDatePicker()
{
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

function LoadItems()
{
    $.ajax(
        {
            url: ItemsUrl,
            type: 'POST',
            data: { From: $('#From').val(), To: $('#To').val() },
            success: function (r) {
                $('#Items').html(r);
                $('#Items tbody tr:odd').addClass('odd');
                $('#Items tbody tr:even').addClass('even');
            },
            error: function () {
                $.Dialog.Alert('주문내역 저장에 실패하였습니다<br>다시 로그인 한 후 주문하여 주십시오.');
            }

        });
}
function GoDetail(OrderId)
{
    $.form(DetialUrl, { OrderId: OrderId, ViewModelType: 'SELECT'}).submit();
}
