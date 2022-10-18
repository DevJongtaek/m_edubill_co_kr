using m_edubill_co_kr.Attributes;
using m_edubill_co_kr.Helper;
using m_edubill_co_kr.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace m_edubill_co_kr.Controllers
{
    [OutputCache(NoStore = true, Duration = 0, VaryByParam = "None")]
    [SimpleAuthorizeAttribute]
    public class InputListController : Controller
    {
        DataProxy mDataProxy = new DataProxy();
        // GET: InputList
        public ActionResult Index(String From = "", String To = "")
        {
            if (String.IsNullOrEmpty(From))
                From = DateTime.Now.Date.AddMonths(-6).ToString("yyyy-MM-dd");
            if (String.IsNullOrEmpty(To))
                To = DateTime.Now.Date.ToString("yyyy-MM-dd");
            ViewBag.From = From;
            ViewBag.To = To;
            var Idx = AccountHelper.GetIdx(Request);
            var Code = AccountHelper.GetCompanyCode(Request);

            var bIdxSub = AccountHelper.GetbIdxSub(Request);
            var cyberNum = mDataProxy.GetcyberNum(bIdxSub);

            ViewBag.cyberNum = cyberNum;
            return View();
        }

        public ActionResult Items(String From, String To)
        {
            From = From.Replace("-", "");
            To = To.Replace("-", "");
            var Idx = AccountHelper.GetIdx(Request);
            var Code = AccountHelper.GetCompanyCode(Request);

            var bIdxSub = AccountHelper.GetbIdxSub(Request);
            var cyberNum = mDataProxy.GetcyberNum(bIdxSub);
            var ViewModel = mDataProxy.GetInputListItems(Idx, Code, From, To, cyberNum);
            
            return View(ViewModel);
        }

    }
}