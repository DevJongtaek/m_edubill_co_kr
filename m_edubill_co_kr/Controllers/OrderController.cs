using m_edubill_co_kr.Attributes;
using m_edubill_co_kr.Models;
using m_edubill_co_kr.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using m_edubill_co_kr.Helper;

namespace m_edubill_co_kr.Controllers
{
    [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
    [SimpleAuthorizeAttribute]
    public class OrderController : Controller
    {
        private DataProxy mDataProxy = new DataProxy();

        // GET: Order
        public ActionResult Index()
        {
            var BIdxSub = AccountHelper.GetbIdxSub(Request);
            var Idx = AccountHelper.GetIdx(Request);
            var Flag = mDataProxy.AllowOrderByFlag(Idx);
            if(!Flag.IsAllowed)
            {
                return RedirectToAction("AlertFlag"); 
            }
            var brands = AccountHelper.GetBrand(Request);
            var BSubCode = mDataProxy.GetBSubCode(BIdxSub);
            var needThumbnail = mDataProxy.GetNeedThumbnail(BIdxSub);
            var needGroup = mDataProxy.GetNeedGroup(BIdxSub);
            var ViewModel = mDataProxy.GetOrderItemViewModel(BIdxSub, brands,BSubCode, needThumbnail, needGroup,Idx);
            var Misu = AccountHelper.GetMisu(Request);
            var Yeosin = AccountHelper.GetYeosin(Request);

            var vatflag = mDataProxy.Getvatflag(BIdxSub);

            ViewBag.Misu = Misu.ToString("N0");
            ViewBag.UseMoney = Math.Max(0, (Yeosin - Misu)).ToString("N0");
            ViewBag.needThumbnail = needThumbnail;
            ViewBag.myflag = mDataProxy.GetMyFlag(BIdxSub);
            ViewBag.vatflag = vatflag;
            return View(ViewModel);
        }

        [HttpPost]
        public string AddCartItems(CartItem[] CartItems)
        {
            //return CartItems[0].ProductCode +"+" + CartItems[0].ProductPrice + "+" + CartItems[0].Count;

            string r = "";

            try
            {
                var UserCode = AccountHelper.GetUserCode(Request);
                mDataProxy.AddCartItems(UserCode, CartItems).ToString();
                r = "true";
            }
            catch (Exception E)
            {
                r = E.ToString();
            }

            return r;
        }
        public ActionResult AlertFlag()
        {
            var Idx = AccountHelper.GetIdx(Request);
            var Flag = mDataProxy.AllowOrderByFlag(Idx);
            var mHomeViewModel = mDataProxy.GetHomeViewModel(Idx);
            ViewBag.PhoneNo = mHomeViewModel.BSubPhoneNo;
            ViewBag.Flag = Flag.Message;

            return View(); ;
        }
        [HttpPost]
        public ActionResult AllowOrderByTime()
        {
            AllowViewModel r = new AllowViewModel();

            var BSubIdx = AccountHelper.GetbIdxSub(Request);

            r = mDataProxy.AllowOrderByTime(BSubIdx);

            return new JsonResult { Data = r };
        }
        [HttpPost]
        public ActionResult AllowOrderByWeek()
        {
            AllowViewModel r = new AllowViewModel();

            var Idx = AccountHelper.GetIdx(Request);

            r = mDataProxy.AllowOrderByWeek(Idx);

            return new JsonResult { Data = r };
        }
        [HttpPost]
        public ActionResult AllowOrderByMisu()
        {
            AllowViewModel r = new AllowViewModel();

            var Idx = AccountHelper.GetIdx(Request);

            r = mDataProxy.AllowOrderByMisu(Idx);

            return new JsonResult { Data = r };
        }
        [AllowAnonymous]
        public ActionResult Thumbnail(int ProductId)
        {
            try
            {
                var r = mDataProxy.Thumbnail(ProductId);
                return new FileContentResult(r, "image");
            }
            catch
            {
                var r = Convert.FromBase64String("R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
                return new FileContentResult(r, "image");
            }
        }
    }
}