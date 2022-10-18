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
    public class SettingController : Controller
    {
        DataProxy mDataProxy = new DataProxy();
        // GET: Setting
        public ActionResult Index()
        {
            var Idx = AccountHelper.GetIdx(Request);
            var bIdxSub = AccountHelper.GetbIdxSub(Request);
            var SubName = mDataProxy.GetBSubName(bIdxSub);
            var SubCode = mDataProxy.GetBSubCode(bIdxSub);
            var Name = AccountHelper.GetCompanyName(Request);
            var Code = AccountHelper.GetCompanyCode(Request);
            var ViewModel = mDataProxy.GetSettingViewModel(Idx);
            ViewBag.SubName = SubName + "(" + SubCode + ")";
            ViewBag.Name = Name + "(" + Code + ")";
            return View(ViewModel);
        }
        [HttpPost]
        public ActionResult Update(SettingViewModel Value)
        {
            var Idx = AccountHelper.GetIdx(Request);
            mDataProxy.UpdateSettingViewModel(Idx, Value);

            return RedirectToAction("Index");
        }
    }
}