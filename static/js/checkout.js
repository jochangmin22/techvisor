$(function () {
    const IMP = window.IMP;
    IMP.init('imp79353885');
    $('.order-form').on('submit', function (e) {
        let amount = 1;
        let type = $('order-form input[name="type"]:checked').val()

        console.log('javascript check : ', type)
        let order_id = AjaxCreateOrder(e);
        if (order_id === false) {
            alert('주문 생성 실패\n 다시 시도해주세요.');
            return false;
        }

        let merchant_id = AjaxStoreTransaction(e, order_id, amount, type);

        if (merchant_id !== '') {
            IMP.request_pay({
                merchant_uid : merchant_id,
                name : 'Techvisor',
                buyer_name : 'shrhkddh',
                buyer_email : 'abs@gmail.com',
                amount : amount
            }, function (rsp) {
                if (rsp.success) {
                    const msg = '결제가 완료되었습니다.';
                    msg += '고유ID : ' + rsp.imp_uid;
                    msg += '상점 거래ID : ' + rsp.merchant_uid;
                    msg += '결제 금액 : ' + rsp.paid_amount;
                    msg += '카드 승인번호 : ' + rsp.apply_num;

                    ImpTransaction(e, order_id, rsp.merchant_uid, rsp.imp_uid, rsp.paid_amount);
                } else {
                    const msg = '결제에 실패하였습니다.';
                    msg += '에러 내용 : ' + rsp.error_msg;
                    console.log(msg);
                }
            });
        }
        return false;
    });
});

function AjaxCreateOrder(e) {
    e.preventDefault();
    let order_id = '';
    let request = $.ajax({
        method : "POST",
        url : order_create_url,
        async : false,
        data : $('.order-form').serialize()
    });
    request.done(function (data) {
        if (data.order_id) {
            order_id = data.order_id;
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("로그인 해주세요.");
        } else {
            alert("문제가 발생했습니다. 다시 시도해주세요.");
        }
    });
    return order_id;
}

function AjaxStoreTransaction(e, order_id, amount, type) {
    e.preventDefault();
    let merchant_id = '';
    let request = $.ajax({
        method : "POST",
        url : order_checkout_url,
        async : false,
        data : {
            order_id : order_id,
            amount : amount,
            type : type,
            csrfmiddlewaretoken : csrf_token,
        }
    });
    request.done(function (data) {
        if (data.works) {
            merchant_id = data.merchant_id;
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존자하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("로그인 해주세요.");
        } else {
            alert("문제가 발생했습니다. 다시 시도해주세요.");
        }
    });
    return merchant_id;
}

function ImpTransaction(e, order_id, merchant_id, imp_id, amount) {
    e.preventDefault();
    let request = $.ajax({
        method : "POST",
        url : order_validation_url,
        async : false,
        data : {
            order_id : order_id,
            merchant_id : merchant_id,
            imp_id : imp_id,
            amount : amount,
            csrfmiddlewaretoken : csrf_token
        }
    });
    request.done(function (data) {
        if (data.works) {
            $(location).attr('href', location.origin+order_complete_url+'?order_id='+order_id)
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("로그인 해주세요.");
        } else {
            alert("문제가 발생했습니다. 다시 시도해주세요.");
        }
    });
}