using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using m_edubill_co_kr.Helper;

namespace m_edubill_co_kr.Attributes
{
    public class SimpleAuthorizeAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            return AccountHelper.IsAuthenticated(httpContext.Request);
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new RedirectToRouteResult(
                                   new RouteValueDictionary 
                                   {
                                       { "action", "Login" },
                                       { "controller", "Home" }
                                   });

        }
    }
}