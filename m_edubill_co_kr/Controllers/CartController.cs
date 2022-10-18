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
    public class CartController : Controller
    {
        DataProxy mDataProxy = new DataProxy();
        // GET: Cart
        public ActionResult Index()
        {
            var Idx = AccountHelper.GetIdx(Request);
            var Flag = mDataProxy.AllowOrderByFlag(Idx);

            var BidxSub = AccountHelper.GetbIdxSub(Request);
            if (!Flag.IsAllowed)
            {
                return RedirectToAction("AlertFlag", "Order");
            }
           
            var From = DateTime.Now.Date.AddDays(1).ToString("yyyy-MM-dd");
            ViewBag.From = From;
         
            ViewBag.myflag = mDataProxy.GetMyFlag(BidxSub);
            ViewBag.minOrderCheck = mDataProxy.GetMinOrderCheck(BidxSub);

            var UserCode = AccountHelper.GetUserCode(Request);
            ViewBag.wdate =   mDataProxy.Get_CartWdate(UserCode);
            ViewBag.Now = DateTime.Now.ToString("yyyyMMdd");
         //   ViewBag.vatflag = mDataProxy.Getvatflag(BidxSub);
            var ViewModel = mDataProxy.GetCartViewModel(Idx);
            
            return View(ViewModel);
           
        }
        [HttpPost]
        public bool ClearCart()
        {
            bool r = false;

            try
            {
                var UserCode = AccountHelper.GetUserCode(Request);
                mDataProxy.ClearCart(UserCode);
                r = true;
            }
            catch
            {

            }

            return r;
        }
        [HttpPost]
        public ActionResult CorfirmOrder(String Comment,String request_day)
        {
            var r = new ResultViewModel();
            

            try
            {
                

                var ComanpyIdx = AccountHelper.GetIdx(Request);
                var BSubIdx = AccountHelper.GetbIdxSub(Request);
                var UserCode = AccountHelper.GetUserCode(Request);
                var myflag = mDataProxy.GetMyFlag(BSubIdx);

                var myflagselect = mDataProxy.GetMyFlagSelect(BSubIdx);

                var d_requestday = mDataProxy.Getd_requestday(BSubIdx);

                var Wdate = mDataProxy.Get_CartWdate(UserCode);
                
            //    mDataProxy.ClearCart(UserCode);

                var vatflag = mDataProxy.Getvatflag(BSubIdx);
                r = mDataProxy.ConfirmOrder(ComanpyIdx, BSubIdx, UserCode, Comment, myflag, myflagselect, d_requestday, request_day, Wdate,vatflag);
                if (r.IsSuccess)
                    mDataProxy.ClearCart(UserCode);
                
                //if (r.IsSuccess2 == false)
                //{
                //    mDataProxy.ClearCart(UserCode);
                //   // return RedirectToAction("HomeUrl");
                //}
            }
            catch (Exception E)
            {
                r.IsSuccess = false;
                r.Error = E.ToString();
            }

            return new JsonResult { Data = r };
        }
        [HttpPost]
        public bool HasCart()
        {
            bool r = false;

            try
            {
                var UserCode = AccountHelper.GetUserCode(Request);
                r = mDataProxy.HasCart(UserCode);
            }
            catch
            {

            }

            return r;
        }
        [HttpPost]
        public bool UpdateItem(int CartId, int Count)
        {
            bool r = false;

            try
            {
                var UserCode = AccountHelper.GetUserCode(Request);
                r = mDataProxy.UpdateCart(UserCode, CartId, Count);
            }
            catch
            {

            }

            return r;
        }
    }
}