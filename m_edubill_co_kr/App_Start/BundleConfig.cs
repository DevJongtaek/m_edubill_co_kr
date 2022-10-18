using System.Web;
using System.Web.Optimization;

namespace m_edubill_co_kr
{
    public class BundleConfig
    {
        // Bundling에 대한 자세한 정보는 http://go.microsoft.com/fwlink/?LinkId=254725를 방문하십시오.
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"
                        , "~/Scripts/jquery.mobile-{version}.js"
                        , "~/Scripts/Common.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/jindo").Include(
            "~/Scripts/Jindo/*.js"));


            // Modernizr의 개발 버전을 사용하여 개발하고 배우십시오. 그런 다음
            // 프로덕션할 준비가 되면 http://modernizr.com의 빌드 도구를 사용하여 필요한 테스트만 선택하십시오.
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

            //bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
            //          "~/Scripts/bootstrap.js",
            //          "~/Scripts/respond.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                        "~/Content/jquery.mobile-{version}.css",
                        "~/Content/Theme/m_edubill_co_kr.css",
                        "~/Content/Theme/jquery.mobile.icons.min.css",
                        "~/Content/Site.css"
                        ));
            //"~/Content/jquery.mobile-1.4.5.css",
        }
    }
}