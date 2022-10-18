using m_edubill_co_kr.Attributes;
using m_edubill_co_kr.Helper;
using m_edubill_co_kr.Models;
using m_edubill_co_kr.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace m_edubill_co_kr.Controllers
{
    [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
    [SimpleAuthorizeAttribute]
    public class OrderListController : Controller
    {
        DataProxy mDataProxy = new DataProxy();

        // GET: OrderList
        public ActionResult Index(String From = "", String To = "")
        {
            if (String.IsNullOrEmpty(From))
                From = DateTime.Now.Date.AddDays(-14).ToString("yyyy-MM-dd");
            if (String.IsNullOrEmpty(To))
                To = DateTime.Now.Date.ToString("yyyy-MM-dd");
            ViewBag.From = From;
            ViewBag.To = To;
            return View();
        }
        [HttpPost]
        public ActionResult Items(String From, String To)
        {
            From = From.Replace("-", "");
            To = To.Replace("-", "");
            var BSubIdx = AccountHelper.GetbIdxSub(Request);
            var UserCode = AccountHelper.GetUserCode(Request);
            var vatflag = mDataProxy.Getvatflag(BSubIdx);
            var ViewModel = mDataProxy.GetOrderListItems(From, To, UserCode, vatflag);
            return View(ViewModel);
        }
        [HttpPost]
        public ActionResult Detail(String OrderId, String ViewModelType, OrderDetialViewModel ViewModel = null)
        {
            if (ViewModelType == "UPDATE")
            {

            }
            var BSubIdx = AccountHelper.GetbIdxSub(Request);
            var CompanyName = AccountHelper.GetCompanyName(Request);
            var CompanyCode = AccountHelper.GetCompanyCode(Request);
            var UserCode = AccountHelper.GetUserCode(Request);

            var myflag = mDataProxy.GetMyFlag(BSubIdx);
            var myflag_select = mDataProxy.GetMyFlagSelect(BSubIdx);
            var d_requestday = mDataProxy.Getd_requestday(BSubIdx);
            var vatflag = mDataProxy.Getvatflag(BSubIdx);
            ViewModel = mDataProxy.GetOrderDetialViewModel(CompanyName, CompanyCode, OrderId, UserCode, myflag, myflag_select, d_requestday,vatflag);
            ViewBag.Yeosin = AccountHelper.GetYeosin(Request);
            ViewBag.Misu = AccountHelper.GetMisu(Request);
            ViewBag.Current = ViewBag.Yeosin - ViewBag.Misu;
            


           
            
            return View(ViewModel);
        }
        public ActionResult Detail()
        {
            return RedirectToAction("Index", "Home");
        }
        [HttpPost]
        public bool Cancel(String OrderId)
        {
            bool r = false;

            var BSubIdx = AccountHelper.GetbIdxSub(Request);


            var CompanyIdx = AccountHelper.GetIdx(Request);
            var UserCode = AccountHelper.GetUserCode(Request);
            var myflag = mDataProxy.GetMyFlag(BSubIdx);

            r = mDataProxy.CancelOrder(CompanyIdx, OrderId, UserCode,myflag);

            return r;
        }
        [HttpPost]
        public bool Update(String OrderId, IEnumerable<CartItem> CartItems, String request_day)
        {
            bool r = false;

            var BSubIdx = AccountHelper.GetbIdxSub(Request);
            var CompanyIdx = AccountHelper.GetIdx(Request);
            var UserCode = AccountHelper.GetUserCode(Request);
            var myflag = mDataProxy.GetMyFlag(BSubIdx);
            var myflag_select = mDataProxy.GetMyFlagSelect(BSubIdx);
             var d_requestday = mDataProxy.Getd_requestday(BSubIdx);
             r = mDataProxy.UpdateOrder(CompanyIdx, OrderId, UserCode, CartItems, myflag, d_requestday, request_day, myflag_select);

            return r;
        }
    }
}