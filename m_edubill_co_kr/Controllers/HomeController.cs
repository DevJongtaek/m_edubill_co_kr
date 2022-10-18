using m_edubill_co_kr.Attributes;
using m_edubill_co_kr.Helper;
using m_edubill_co_kr.Models;
using m_edubill_co_kr.ViewModels;
using m_edubill_co_kr.ViewModels.Accounts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace m_edubill_co_kr.Controllers
{
    [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
    [SimpleAuthorizeAttribute]
    public class HomeController : Controller
    {
        DataProxy mDataProxy = new DataProxy();

        public ActionResult Index(bool ShowPopup = true)
        {
            var Idx = AccountHelper.GetIdx(Request);

            var ViewModel = mDataProxy.GetHomeViewModel(Idx);

            var BSubIdx = AccountHelper.GetbIdxSub(Request);

            var LogoSource = mDataProxy.GetLogoSource(BSubIdx);

            ViewBag.LogoSource = @"http://edubill.co.kr/fileupdown/app/" + LogoSource;


            if(ShowPopup)
            {
                ViewModel.StaticNotice = String.Join(" ", Server.HtmlEncode(mDataProxy.GetStaticNotice(BSubIdx)).Split(new String[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).Select(c => "<div>" + c + "</div>"));
                ViewModel.FlagNotice = String.Join(" ", Server.HtmlEncode(mDataProxy.GetFlagNotice(Idx)).Split(new String[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).Select(c => "<div>" + c + "</div>"));
                ViewModel.LocalNotice = String.Join(" ", Server.HtmlEncode(mDataProxy.GetLocalNotice(Idx)).Split(new String[] { Environment.NewLine }, StringSplitOptions.RemoveEmptyEntries).Select(c => "<div>" + c + "</div>"));
            }
            return View(ViewModel);
        }

        [AllowAnonymous]
        public ActionResult Login()
        {
            ViewBag.LoginID = "";
            ViewBag.SaveId = false;
            if (Request.Cookies.AllKeys.Contains("LoginID"))
            {
                ViewBag.LoginID = Request.Cookies["LoginID"].Value;
                ViewBag.SaveId = true;
            }
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        public ActionResult Login(LoginViewModel value)
        {
            if (value.Password == null)
                value.Password = "";
            var Session = mDataProxy.MakeSession(value.LoginID, value.Password);
            if(String.IsNullOrEmpty(Session))
            {
                ViewBag.LoginID = value.LoginID;
                ViewBag.SaveId = value.SaveId;
                ViewBag.Error = true;
                return View();
            }
            else
            {
                Response.Cookies.Clear();
                var SessionCookie = new HttpCookie("Session",Session);
                if(value.RemainSession)
                {
                    SessionCookie.Expires = DateTime.Now.AddMonths(1);
                }
                Response.Cookies.Add(SessionCookie);
                if(value.SaveId)
                {

                    Response.Cookies.Add(new HttpCookie("LoginID", value.LoginID) { Expires = DateTime.Now.AddMonths(1) });
                }

                return RedirectToAction("Index", new { ShowPopup = true });
            }
        }
        [AllowAnonymous]
        [HttpPost]
        public ActionResult IsService(LoginViewModel value)
        {
            var tcode = value.LoginID.Substring(0, 4);
            var r = mDataProxy.GetSclose(tcode);
            if(r == "n")
            {
                return new JsonResult { Data = new ResultViewModel { IsSuccess = false } };
            }
            else
            {
                return new JsonResult { Data = new ResultViewModel { IsSuccess = true } };
            }
        }

        [HttpPost]
        public ActionResult Logout()
        {
            var Idx = AccountHelper.GetIdx(Request);
            mDataProxy.Logout(Idx);
            return RedirectToAction("Index");
        }

    }
}