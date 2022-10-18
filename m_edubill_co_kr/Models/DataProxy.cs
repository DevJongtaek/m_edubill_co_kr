using m_edubill_co_kr.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Configuration;

namespace m_edubill_co_kr.Models
{
    public class DataProxy
    {
        private String _ConnectionString = null;

        public String ConnectionString
        {
            get
            {
                if (String.IsNullOrEmpty(_ConnectionString))
                {
                    //var mConnectionStringBuilder = new SqlConnectionStringBuilder();
                    //mConnectionStringBuilder.UserID = "sa";
                    //mConnectionStringBuilder.Password = "edubill@6508";
                    //mConnectionStringBuilder.InitialCatalog = "edubill_co_kr";
                    //mConnectionStringBuilder.DataSource = @"220.73.136.52";
                    ////mConnectionStringBuilder.UserID = "sa";
                    ////mConnectionStringBuilder.Password = "1234";
                    ////mConnectionStringBuilder.InitialCatalog = "edubill_co_kr";
                    ////mConnectionStringBuilder.DataSource = @"192.168.219.114";
                    //_ConnectionString = mConnectionStringBuilder.ToString();
                    _ConnectionString = ConfigurationManager.ConnectionStrings["edubill_co_kr"].ConnectionString;
                }
                return _ConnectionString;
            }
        }

        #region Account

        public string MakeSession(String LoginId, String Password)
        {
            var SelectQuery =
                @"SELECT Company.idx
                FROM tb_company Company JOIN tb_company BSub ON Company.bidxsub = BSub.idx
                WHERE BSub.tcode + Company.tcode = @LoginId AND Company.soundfile = @Password";
            var UpdateQuery =
                @"UPDATE tb_company
                SET adminProgram = @Session
                WHERE idx = @idx";

            String Session = "";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var SelectCommand = Connection.CreateCommand();
                SelectCommand.CommandText = SelectQuery;
                SelectCommand.Parameters.AddWithValue("@LoginId", LoginId);
                SelectCommand.Parameters.AddWithValue("@Password", Password);
                var o = SelectCommand.ExecuteScalar();
                if(o != null)
                {
                    var idx = Convert.ToInt32(o);
                    var tSession = Guid.NewGuid().ToString();
                    var UpdateCommand = Connection.CreateCommand();
                    UpdateCommand.CommandText = UpdateQuery;
                    UpdateCommand.Parameters.AddWithValue("@Session", tSession);
                    UpdateCommand.Parameters.AddWithValue("@idx", idx);
                    UpdateCommand.ExecuteNonQuery();
                    Session = tSession;
                }
            }

            return Session;
        }

        public void Logout(int Idx)
        {
            var UpdateQuery =
                @"UPDATE tb_company
                SET adminProgram = ''
                WHERE idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var UpdateCommand = Connection.CreateCommand();
                UpdateCommand.CommandText = UpdateQuery;
                UpdateCommand.Parameters.AddWithValue("@idx", Idx);
                UpdateCommand.ExecuteNonQuery();
            }
        }

        public bool HasSession(String Session)
        {
            bool r = false;

            var Query = "SELECT idx FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = true;
            }

            return r;
        }

        public int GetbIdxSub(String Session)
        {
            int r = 0;

            var Query = "SELECT bidxsub FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = Convert.ToInt32(o);
            }

            return r;
        }

        public int GetIdx(String Session)
        {
            int r = 0;

            var Query = "SELECT idx FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = Convert.ToInt32(o);
            }

            return r;
        }

        public string GetSclose(string tcode)
        {
            string r = "";

            var Query = "SELECT sclose FROM tb_company WHERE tcode = @tcode AND flag = '1'";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@tcode", tcode);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = o.ToString();
            }

            return r;
        }

        public string GetCompanyName(String Session)
        {
            string r = "";

            var Query = "SELECT comname FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = o.ToString();
            }

            return r;
        }

        public string GetCompanyCode(String Session)
        {
            string r = "";

            var Query = "SELECT tcode FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = o.ToString();
            }

            return r;
        }
        public int GetMisu(String Session)
        {
            int r = 0;

            var Query = "SELECT mi_money FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = Convert.ToInt32(o);
            }

            return r;
        }
        public int GetYeosin(String Session)
        {
            int r = 0;

            var Query = "SELECT ye_money FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = Convert.ToInt32(o);
            }

            return r;
        }

        public string GetUserCode(String Session)
        {
            string r = "";

            var Query = "SELECT bidxsub, idxsub, idx FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var Reader = Command.ExecuteReader();
                if(Reader.Read())
                {
                    r = Reader.GetInt32(0).ToString() + Reader.GetInt32(1).ToString() + Reader.GetInt32(2).ToString();
                }
            }

            return r;
        }

        public string[] GetBrand(String Session)
        {
            List<string> r = new List<string>(new string[] { "00000" });

            var Query = "SELECT cbrandchoice FROM tb_company WHERE adminProgram = @Session";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Session", Session);
                var o = Command.ExecuteScalar();
                r.AddRange(o.ToString().Split(new String[] { " " }, StringSplitOptions.RemoveEmptyEntries));
            }

            return r.ToArray();
        }

        #endregion

        #region Home
        public HomeViewModel GetHomeViewModel(int Idx)
        {
            HomeViewModel r = null;
            var Query =
                @"SELECT Company.comname + '/' + BSub.comname, BSub.tel1 + '-' + BSub.tel2 + '-' + BSub.tel3, BSub.fax1 + '-' + BSub.fax2 + '-' + BSub.fax3, 
                BSub.comname + ' | 사업자등록번호:' + BSub.companynum1 + '-' + BSub.companynum2 + '-' + BSub.companynum3 + ' | ' + BSub.addr + BSub.addr2 + ' | 대표이사:' + BSub.name + ' | 전화:' + BSub.tel1 + '-' + BSub.tel2 + '-' + BSub.tel3 + ' | e-메일:' + BSub.homepage
                FROM tb_company Company JOIN tb_company BSub ON Company.bidxsub = BSub.idx
                WHERE Company.idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var Reader = Command.ExecuteReader();
                if(Reader.Read())
                {
                    r = new HomeViewModel();
                    r.Tilte = Reader.GetString(0);
                    r.BSubPhoneNo = Reader.GetString(1);
                    r.SubPhoneNo = Reader.GetString(2);
                    r.BSubInfo = Reader.GetString(3);
                }
            }

            return r;
        }

        public String GetLogoSource(int BSubIdx)
        {
            String r = "default.gif";
            var Query =
                @"SELECT mainname FROM tb_adminuser WHERE usercode = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx.ToString());
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public String GetStaticNotice(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT com_notice FROM tb_company WHERE (noticeflag = '1' OR noticeflag = 'a') AND idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public String GetFlagNotice(int Idx)
        {
            String r = "";

            var Query1 =
                @"SELECT BSub.chk_gongi1 FROM tb_company Company JOIN tb_company BSub ON Company.bidxsub = BSub.idx  WHERE Company.idx = @Idx AND Company.orderflag = '4'";
            var Query2 =
                @"SELECT BSub.chk_gongi2 FROM tb_company Company JOIN tb_company BSub ON Company.bidxsub = BSub.idx  WHERE Company.idx = @Idx AND Company.orderflag = '5'";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command1 = Connection.CreateCommand();
                Command1.CommandText = Query1;
                Command1.Parameters.AddWithValue("@Idx", Idx);
                var o = Command1.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
                if (String.IsNullOrEmpty(r))
                {
                    var Command2 = Connection.CreateCommand();
                    Command2.CommandText = Query2;
                    Command2.Parameters.AddWithValue("@Idx", Idx);
                    o = Command2.ExecuteScalar();
                    if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                        r = o.ToString();
                }
            }

            return r;
        }

        public String GetLocalNotice(int Idx)
        {
            String r = "";

            var Query =
                @"SELECT ch_gongi FROM tb_company WHERE idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }



        #endregion

        #region Order

        public String GetBSubCode(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT tcode FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public String GetBSubName(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT comname FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }


        public String GetMyFlag(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT myflag FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public String GetMyFlagSelect(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT myflag_select FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public String Getd_requestday(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT d_requestday FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }


        public String Getvatflag(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT vatflag FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }


        public bool GetNeedThumbnail(int BSubIdx)
        {
            bool r = true;

            var Query =
                @"SELECT proflag2 FROM tb_company WHERE (noticeflag = '1' OR noticeflag = 'a') AND idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = o.ToString() == "1";
            }

            return r;
        }

        public bool GetNeedGroup(int BSubIdx)
        {
            bool r = true;

            var Query =
                @"SELECT proflag1 FROM tb_company WHERE (noticeflag = '1' OR noticeflag = 'a') AND idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null)
                    r = o.ToString() == "2";
            }

            return r;
        }


        public String GetMinOrderCheck(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT MinOrderCheck FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        int NowTime;
        int Order_checkStime;
        int Order_checkEtime;
        public OrderItemViewModel GetOrderItemViewModel(int BIdxSub, string[] brands, String BIdxCode, bool needThumbnail, bool needGroup,int Idx)
        {
         
            OrderItemViewModel r = new OrderItemViewModel();

            //주문허용시간
            var Query =
           @"SELECT order_weekgubun, order_weekchoice, order_checkStime, order_checkEtime FROM tb_company WHERE idx = @Idx";
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var Reader = Command.ExecuteReader();
                if (Reader.Read())
                {
                    var order_weekgubun = Reader.GetString(0);
                    if (order_weekgubun == "1")
                    {
                        //r.IsAllowed = true;
                    }
                    else
                    {
                       // r.IsAllowed = false;
                        var order_weekchoice = Reader.GetString(1);
                        var vorder_checkStime = Reader.GetString(2);
                        var vorder_checkEtime = Reader.GetString(3);
                        var order_checkStime = int.Parse(vorder_checkStime);
                        var order_checkEtime = int.Parse(vorder_checkEtime);
                        var nowtime = DateTime.Now.Hour * 100 + DateTime.Now.Minute;

                        NowTime = nowtime;
                        Order_checkStime = order_checkStime;
                        Order_checkEtime = order_checkEtime;

                        //if (nowtime >= order_checkStime)
                        //{
                        //    var week = 0;
                        //    switch (DateTime.Now.DayOfWeek)
                        //    {
                        //        case DayOfWeek.Monday:
                        //            week = 3;
                        //            break;
                        //        case DayOfWeek.Tuesday:
                        //            week = 4;
                        //            break;
                        //        case DayOfWeek.Wednesday:
                        //            week = 5;
                        //            break;
                        //        case DayOfWeek.Thursday:
                        //            week = 6;
                        //            break;
                        //        case DayOfWeek.Friday:
                        //            week = 7;
                        //            break;
                        //        case DayOfWeek.Saturday:
                        //            week = 1;
                        //            break;
                        //        case DayOfWeek.Sunday:
                        //            week = 2;
                        //            break;
                        //        default:
                        //            break;
                        //    }
                        //    //if (order_weekchoice.Contains(week.ToString()))
                        //    //   // r.IsAllowed = true;
                        //}
                        //if (nowtime <= order_checkEtime)
                        //{
                        //    var week = 0;
                        //    switch (DateTime.Now.DayOfWeek)
                        //    {
                        //        case DayOfWeek.Monday:
                        //            week = 2;
                        //            break;
                        //        case DayOfWeek.Tuesday:
                        //            week = 3;
                        //            break;
                        //        case DayOfWeek.Wednesday:
                        //            week = 4;
                        //            break;
                        //        case DayOfWeek.Thursday:
                        //            week = 5;
                        //            break;
                        //        case DayOfWeek.Friday:
                        //            week = 6;
                        //            break;
                        //        case DayOfWeek.Saturday:
                        //            week = 7;
                        //            break;
                        //        case DayOfWeek.Sunday:
                        //            week = 1;
                        //            break;
                        //        default:
                        //            break;
                        //    }
                        //    //if (order_weekchoice.Contains(week.ToString()))
                        //    //    r.IsAllowed = true;
                        //}
                       
                    }
                }
                Reader.Close();
            }


            using (SqlConnection mConnection = new SqlConnection(ConnectionString))
            {
                mConnection.Open();
                //ProductGroup
                r.ProductGroups = new List<ProductGroup>();
                if (needGroup)
                {
                    var ProductGroupCommand = mConnection.CreateCommand();
                    ProductGroupCommand.CommandText = "SELECT [sidx] ,[sname] FROM [edubill_co_kr].[dbo].[tb_product_submenu] WHERE idx = @idx";
                    ProductGroupCommand.Parameters.AddWithValue("@idx", BIdxSub);
                    var ProductGroupReader = ProductGroupCommand.ExecuteReader();

                    while (ProductGroupReader.Read())
                    {
                        r.ProductGroups.Add(new ProductGroup
                        {
                            Code = ProductGroupReader[0].ToString(),
                            Name = ProductGroupReader[1].ToString(),
                        });
                    }

                    ProductGroupReader.Close();
                }
             



                //Product
                r.Products = new List<Product>();

                var ProductCommand = mConnection.CreateCommand();
                ProductCommand.CommandText = "SELECT prochoice, idx, pcode, pname, ptitle, pprice, cbrandchoice, proout, order_weekchoice, isnull(proimage,'') FROM tb_product WHERE usercode = @usercode ORDER BY pcode";
                ProductCommand.Parameters.AddWithValue("@usercode", BIdxSub);
                var ProductReader = ProductCommand.ExecuteReader();

                while (ProductReader.Read())
                {
                    var cbrandchoice = ProductReader.GetString(6);
                    var ThisDay = '0';

                    if (NowTime >= Order_checkStime)
                    {
                       
                        switch (DateTime.Now.DayOfWeek)
                        {
                            case DayOfWeek.Monday:
                                ThisDay = '3';
                                break;
                            case DayOfWeek.Tuesday:
                                ThisDay = '4';
                                break;
                            case DayOfWeek.Wednesday:
                                ThisDay = '5';
                                break;
                            case DayOfWeek.Thursday:
                                ThisDay = '6';
                                break;
                            case DayOfWeek.Friday:
                                ThisDay = '7';
                                break;
                            case DayOfWeek.Saturday:
                                ThisDay = '1';
                                break;
                            case DayOfWeek.Sunday:
                                ThisDay = '1';
                                break;
                        }
                        //if (order_weekchoice.Contains(week.ToString()))
                        //   // r.IsAllowed = true;
                    }


                    if (NowTime <= Order_checkEtime)
                    {

                        switch (DateTime.Now.DayOfWeek)
                        {
                            case DayOfWeek.Monday:
                                ThisDay = '2';
                                break;
                            case DayOfWeek.Tuesday:
                                ThisDay = '3';
                                break;
                            case DayOfWeek.Wednesday:
                                ThisDay = '4';
                                break;
                            case DayOfWeek.Thursday:
                                ThisDay = '5';
                                break;
                            case DayOfWeek.Friday:
                                ThisDay = '6';
                                break;
                            case DayOfWeek.Saturday:
                                ThisDay = '7';
                                break;
                            case DayOfWeek.Sunday:
                                ThisDay = '1';
                                break;
                        }
                    }
                    if (brands.Length == 1 || brands.Any(c => cbrandchoice.Contains(c)))
                    {
                        var Added = new Product
                        {
                            GroupCode = ProductReader[0].ToString(),
                            ProductId = ProductReader.GetInt32(1),
                            Code = ProductReader[2].ToString(),
                            Name = ProductReader[3].ToString(),
                            Unit = ProductReader[4].ToString(),
                            Price = ProductReader.GetInt32(5),
                            IsOut = ProductReader.GetString(7) == "n",
                            NotWeek = !ProductReader.GetString(8).Contains(ThisDay),
                        };
                        if (needThumbnail)
                        {
                            var Thumbnail = ProductReader.GetString(9);
                            if (!String.IsNullOrEmpty(Thumbnail))
                                Thumbnail = "http://edubill.co.kr/fileupdown/pr_image/" + BIdxCode + "/" + Thumbnail;
                            Added.ThumbnailPath = Thumbnail;
                        }

                        r.Products.Add(Added);
                    }
                }

                ProductReader.Close();

            }
            return r;
        }

        public int AddCartItems(string UserCode, CartItem[] CartItems)
        {
            int r = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                //var ClearCommand = Connection.CreateCommand();
                //ClearCommand.CommandText = "DELETE FROM [tb_product_cart] WHERE [usercode] = @UserCode";
                //ClearCommand.Parameters.AddWithValue("@UserCode", UserCode);
                //ClearCommand.ExecuteNonQuery();
                var AddCommand = Connection.CreateCommand();
                AddCommand.CommandText = "INSERT INTO [tb_product_cart] ([usercode] ,[pcode] ,[pprice] ,[pcnt] ,[wdate]) VALUES (@usercode ,@pcode ,@pprice ,@pcnt ,@wdate)";
                foreach (var mCartItem in CartItems)
                {
                    if (mCartItem.Count > 0)
                    {
                        AddCommand.Parameters.Clear();
                        AddCommand.Parameters.AddWithValue("@usercode", UserCode);
                        AddCommand.Parameters.AddWithValue("@pcode", mCartItem.ProductCode);
                        AddCommand.Parameters.AddWithValue("@pprice", mCartItem.ProductPrice);
                        AddCommand.Parameters.AddWithValue("@pcnt", mCartItem.Count);
                        AddCommand.Parameters.AddWithValue("@wdate", DateTime.Now.ToString("yyyyMMdd"));
                        r += AddCommand.ExecuteNonQuery();
                    }
                }
            }
            return r;
        }

        public CartViewModel GetCartViewModel(int Idx)
        {
            CartViewModel r = new CartViewModel();
            r.CartItems = new List<CartItem>();

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var CompanyCommand = Connection.CreateCommand();
              //  CompanyCommand.CommandText = "select ye_money, mi_money, usemoney, bidxsub, idxsub,myflag from tb_company where idx = @Idx";

                CompanyCommand.CommandText = "select a.ye_money, a.mi_money, a.usemoney, a.bidxsub, a.idxsub,b.myflag,b.myflag_select,b.d_requestday,b.vatflag,b.MinOrderAmt,ISNULL(b.MinOrderCheck,'n') from tb_company a join tb_company b on b.idx = a.bidxsub where a.idx = @idx";


                CompanyCommand.Parameters.AddWithValue("@Idx", Idx);
                var CompanyReader = CompanyCommand.ExecuteReader();
                var UserCode = "";
                if (CompanyReader.Read())
                {
                    r.Yeosin = CompanyReader.GetInt32(0);
                    r.Misu = CompanyReader.GetInt32(1);
                    r.Current = CompanyReader.GetInt32(2);
                    UserCode = CompanyReader[3].ToString() + CompanyReader[4].ToString() + Idx.ToString();
                    
                   r.myflag = CompanyReader.GetString(5);
                   r.myflag_select = CompanyReader.GetString(6);
                   r.d_requestday = CompanyReader.GetString(7);
                 
                    r.vatflag = CompanyReader.GetString(8);
                    r.MinOrderAmt = CompanyReader.GetInt32(9);
                    r.MinOrderCheck = CompanyReader.GetString(10);

                }
                r.Current = r.Yeosin - r.Misu;
            //    r.wdate = wdate;
                CompanyReader.Close();

                var CartItemsCommand = Connection.CreateCommand();
                CartItemsCommand.CommandText =
                    @"select cart.idx, cart.pcode, product.pprice, cart.pcnt, product.pname, product.ptitle, product.gubun
                    from tb_product_cart cart
                    join tb_product product on substring(cart.usercode, 1, 5) = product.usercode and cart.pcode = product.pcode
                    where cart.usercode = @UserCode
                    order by cart.pcode";
                CartItemsCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var CartItemsReader = CartItemsCommand.ExecuteReader();
                while (CartItemsReader.Read())
                {
                    var Added = new CartItem
                    {
                        Id = CartItemsReader.GetInt32(0),
                        ProductCode = CartItemsReader.GetString(1),
                        ProductPrice = CartItemsReader.GetInt32(2),
                        Count = CartItemsReader.GetInt32(3),
                        ProductName = CartItemsReader.GetString(4),
                        ProductUnit = CartItemsReader.GetString(5),
                        HasTax = CartItemsReader.GetString(6) == "과세",
                    };

                    //포함
                    if (r.vatflag == "y")
                    {
                        //세액
                        if (Added.HasTax)
                        {
                            Added.Tax = (int)Math.Round(((double)(Added.ProductPrice * Added.Count) / 11d));
                        }
                        else
                        {
                            Added.Tax = 0;
                        }


                        //공급가
                        Added.Amt = Added.ProductPrice * Added.Count - Added.Tax;
                    }

                     //별도
                    else if (r.vatflag == "n")
                    {
                        //세액
                        if (Added.HasTax)
                        {
                            Added.Tax = (int)Math.Round(((double)(Added.ProductPrice * Added.Count) / 11d));
                        }
                        else
                        {
                            Added.Tax = 0;
                        }


                        //공급가
                        Added.Amt = Added.ProductPrice * Added.Count;
                    }
                    else
                    {
                        Added.Tax = 0;
                        Added.Amt = Added.ProductPrice * Added.Count;
                    }

                 

                    r.CartItems.Add(Added);
                }
                CartItemsReader.Close();
                var OrderCntCommand = Connection.CreateCommand();
                OrderCntCommand.CommandText =
                    @" SELECT COUNT(*) FROM tb_order
                        WHERE usercode  = @UserCode 
                        AND  rordermoney != 0 
                         and orderday =  @orderday ";
                OrderCntCommand.Parameters.AddWithValue("@UserCode", UserCode);
                OrderCntCommand.Parameters.AddWithValue("@orderday", DateTime.Now.ToString("yyyyMMdd"));
                var OrderCntReader = OrderCntCommand.ExecuteReader();
                if(OrderCntReader.Read())
                {
                    r.ordercnt = OrderCntReader.GetInt32(0);
                }
            }

            return r;
        }

        public bool ClearCart(String UserCode)
        {
            bool r = false;

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var ClearCommand = Connection.CreateCommand();
                ClearCommand.CommandText = "DELETE FROM [tb_product_cart] WHERE [usercode] = @UserCode";
                ClearCommand.Parameters.AddWithValue("@UserCode", UserCode);
                ClearCommand.ExecuteNonQuery();

                r = true;
            }

            return r;
        }

        public bool HasCart(String UserCode)
        {
            bool r = false;

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var CartItemsCommand = Connection.CreateCommand();
                CartItemsCommand.CommandText =
                    @"select Count(cart.idx)
                    from tb_product_cart cart
                    where cart.usercode = @UserCode";
                CartItemsCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var o = CartItemsCommand.ExecuteScalar();
                if (o != null)
                    r = Convert.ToInt32(o) > 0;

            }

            return r;
        }


        //장바구니 주문일자 추가
        public String Get_CartWdate(String UserCode)
        {
            String r = "";

            var Query =
                @"select top 1 wdate from tb_product_cart  where usercode = @UserCode";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@UserCode", UserCode);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }

        public bool UpdateCart(String UserCode, int CartId, int Count)
        {
            bool r = false;

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();

                var CartItemsCommand = Connection.CreateCommand();
                CartItemsCommand.CommandText =
                    @"UPDATE tb_product_cart
                    SET pcnt = @Count
                    WHERE usercode = @UserCode AND idx = @CartId";
                CartItemsCommand.Parameters.AddWithValue("@UserCode", UserCode);
                CartItemsCommand.Parameters.AddWithValue("@CartId", CartId);
                CartItemsCommand.Parameters.AddWithValue("@Count", Count);
                CartItemsCommand.ExecuteNonQuery();
                r = true;
            }

            return r;
        }

        public ResultViewModel ConfirmOrder(int CompanyIdx, int BSubIdx, String UserCode, String Comment,String MyFlag,String MyFlagSelect,String d_request_day,String request_day,String Wdate,String vatflag)
        {
            var r = new ResultViewModel();
            var l = new ResultViewModel();
            var AmtQuery =
                                @"select sum(product.pprice * cart.pcnt)
                                    from tb_product_cart cart
                                    join tb_product product on substring(cart.usercode, 1, 5) = product.usercode and cart.pcode = product.pcode
                                    where cart.usercode = @usercode";

            var SumAmtQuery =
                //                @"select sum(product.pprice * cart.pcnt)
                //                    from tb_product_cart cart
                //                    join tb_product product on substring(cart.usercode, 1, 5) = product.usercode and cart.pcode = product.pcode
                //                    where cart.usercode = @usercode";
                 @"select sum(
                            case product.gubun when '과세' then
	                            case company.vatflag when 'n' then	
		                             (product.pprice * cart.pcnt*1.1)
	                            else product.pprice * cart.pcnt end
                            else  
	                            product.pprice * cart.pcnt
                            end
                            )
                    from tb_product_cart cart
                    join tb_product product on substring(cart.usercode, 1, 5) = product.usercode and cart.pcode = product.pcode
					join tb_company company on substring(cart.usercode, 1, 5) = company.idx
                    where cart.usercode = @usercode";
            var UseMoneyQuery =
                @"select ye_money ,mi_money from tb_company where idx = @CompanyIdx";
            var OrderInsertQuery =
                @"INSERT INTO [tb_order] 
                    ([idx] ,[usercode] ,[comname1] ,[comname2] ,[orderday] ,[okday] ,[ordermoney] ,[rordermoney]
                    ,[carname] ,[ordering] ,[flag] ,[deflag] ,[deflagday] ,[sendhpnum] ,[wdate] ,[wuserid] ,[edate] ,[euserid]
                    ,[FtpFile] ,[order_cmt] ,[request_day] ,[orderflag] ,[orderflag_m] ,[posSeq])
                SELECT 
                    @idx ,@usercode ,idxsubname, comname ,@orderday ,'' ,@ordermoney ,@rordermoney
                    ,tb_car.dcarno ,'0' ,'n' ,'n' ,NULL ,NULL ,@wdate ,'' ,NULL ,NULL
                    ,NULL ,@order_cmt ,@request_day ,'n' ,'n' ,''
                FROM tb_company JOIN tb_car ON tb_company.dcarno = tb_car.idx
                WHERE tb_company.idx = @CompanyIdx";


            var MobileOrderInsertQuery =
               @"INSERT INTO [dbo].[MobileOrder]
                ([OrderIdx],[usercode],[comname1],[comname2],[CreateDate])
                SELECT 
                    @idx ,@usercode ,idxsubname, comname ,getdate()
                FROM tb_company 
                WHERE tb_company.idx = @CompanyIdx";


            var ProductInsertQuery =
                @"insert into tb_order_product (idx, pcodeidx, pcode, pname, pprice, ordernum, rordernum, wdate, wuserid, edate, euserid, flag, flagidx, dcenterchoice)                                                                                                                                                                                                                                                                                                        
                    select @idx, product.idx, max(cart.pcode), max(product.pname), max(product.pprice), sum(cart.pcnt), sum(cart.pcnt), @wdate, NULL, NULL, NULL, 'F', '', max(product.dcenterchoice)
                    from tb_product_cart cart
                    join tb_product product on substring(cart.usercode, 1, 5) = product.usercode and cart.pcode = product.pcode
                    where cart.usercode = @usercode
                    group by product.idx";
            var   MisuUpdateQuery =
                    @"update tb_company set mi_money = mi_money + @Amt where idx = @CompanyIdx";


            var MisuUpdateQuery1 =
                  @"update tb_company set mi_money = mi_money + @Amt,ye_money = ye_money*2 where idx = @CompanyIdx";
           
           

            var Amt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var AmtCommand = Connection.CreateCommand();
                AmtCommand.CommandText = AmtQuery;
                AmtCommand.Parameters.AddWithValue("@usercode", UserCode);
                var o = AmtCommand.ExecuteScalar();
                if (o != null)
                {
                    Amt = Convert.ToInt32(o);
                }
                else
                    return r;
            }

            var SumAmt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var SumAmtCommand = Connection.CreateCommand();
                SumAmtCommand.CommandText = SumAmtQuery;
                SumAmtCommand.Parameters.AddWithValue("@usercode", UserCode);
                var o = SumAmtCommand.ExecuteScalar();
                if (o != null)
                {
                    SumAmt = Convert.ToInt32(o);
                }
                else
                    return r;
            }
            //여기서 주문 가능 여부를 판단한다.
            if (!AllowOrderByFlag(CompanyIdx).IsAllowed)
            {
                return r;
            }
            if (!AllowOrderByTime(BSubIdx).IsAllowed)
            {
                r.Error = "지금은 주문 차단 시간이므로 주문을 하실 수 없습니다.";
                return r;
            }
            if (!AllowOrderByWeek(CompanyIdx).IsAllowed)
            {
                r.Error = "지금은 주문 차단 시간이므로 주문을 하실 수 없습니다.";
                return r;
            }
            if (!AllowOrderByMisu(CompanyIdx).IsAllowed)
            {
                r.Error = "주문 가능한 여신금액이 존재하시 않습니다.";
                return r;
            }

            var UseMoney = 0;
            var ye_money = 0;
            var mi_money = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var UseMoneyCommand = Connection.CreateCommand();
                UseMoneyCommand.CommandText = UseMoneyQuery;
                UseMoneyCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                var UseMoneyReader = UseMoneyCommand.ExecuteReader();
                if(UseMoneyReader.Read())
                {
                    ye_money = UseMoneyReader.GetInt32(0);
                    mi_money = UseMoneyReader.GetInt32(1);
                    UseMoney = ye_money - mi_money;
                }
                else
                {
                    return r;
                }
                UseMoneyReader.Close();
              
            }

            //if (Wdate != DateTime.Now.ToString("yyyy-MM-dd").Replace("-", ""))
            //{
            //    r.Error = String.Format("주문일자와 장바구니에 담은 일자가 달라서 주문 할 수 없습니다.<br>주문 내역을 다시 입력 바랍니다.");
                

            //    ClearCart(UserCode);

            //    return r;
            //}
           

            if (MyFlag == "y")
            {
                if (MyFlagSelect == "2")
                {
                    if (Amt > UseMoney)
                    {
                        r.Error = String.Format("<font style='color :Blue; font-weight:bold'>[당일주문] 금액이 [주문가능] 금액을 초과하여 주문 할 수 없습니다.</font><br>여신금액 : {0:N0}원<br>미수금액 : {1:N0}원<br>주문가능금액 : {2:N0}원<br>당일주문금액 : {3:N0}원", ye_money, mi_money, UseMoney, SumAmt);
                        return r;
                    }
                }
            }

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                var idx = String.Format("{0:yyyyMMddHHmmss}{1:00000}", DateTime.Now, CompanyIdx);
                Connection.Open();
                var mTransaction = Connection.BeginTransaction();
                try
                {
                    var OrderInsertCommnad = Connection.CreateCommand();
                    OrderInsertCommnad.Transaction = mTransaction;
                    OrderInsertCommnad.CommandText = OrderInsertQuery;
                    OrderInsertCommnad.Parameters.AddWithValue("@idx", idx);
                    OrderInsertCommnad.Parameters.AddWithValue("@usercode", UserCode);
                    OrderInsertCommnad.Parameters.AddWithValue("@orderday", String.Format("{0:yyyyMMdd}", DateTime.Now));
                    OrderInsertCommnad.Parameters.AddWithValue("@ordermoney", Amt);
                    OrderInsertCommnad.Parameters.AddWithValue("@rordermoney", Amt);
                    OrderInsertCommnad.Parameters.AddWithValue("@wdate", String.Format("{0}", DateTime.Now.ToString()));
                    OrderInsertCommnad.Parameters.AddWithValue("@order_cmt", Comment);
                   // OrderInsertCommnad.Parameters.AddWithValue("@request_day", String.Format("{0:yyyyMMdd}", DateTime.Now.AddDays(1)));
                    if (d_request_day == "y")
                    {
                        OrderInsertCommnad.Parameters.AddWithValue("@request_day", request_day.Substring(5, 2).ToString() + request_day.Substring(8, 2).ToString());
                    }
                    else
                    {
                        OrderInsertCommnad.Parameters.AddWithValue("@request_day", String.Format("{0:yyyyMMdd}", DateTime.Now.AddDays(1)));
                    }
                    OrderInsertCommnad.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                    OrderInsertCommnad.ExecuteNonQuery();

                    //MobileOrderInsertQuery
                    var MobileOrderInsertCommnad = Connection.CreateCommand();
                    MobileOrderInsertCommnad.Transaction = mTransaction;
                    MobileOrderInsertCommnad.CommandText = MobileOrderInsertQuery;
                    MobileOrderInsertCommnad.Parameters.AddWithValue("@idx", idx);
                    MobileOrderInsertCommnad.Parameters.AddWithValue("@usercode", UserCode);
                    MobileOrderInsertCommnad.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                    MobileOrderInsertCommnad.ExecuteNonQuery();

                    var OrderProductInsertCommand = Connection.CreateCommand();
                    OrderProductInsertCommand.Transaction = mTransaction;
                    OrderProductInsertCommand.CommandText = ProductInsertQuery;
                    OrderProductInsertCommand.Parameters.AddWithValue("@idx", idx);
                    OrderProductInsertCommand.Parameters.AddWithValue("@wdate", String.Format("{0}", DateTime.Now.ToString()));
                    OrderProductInsertCommand.Parameters.AddWithValue("@usercode", UserCode);
                    OrderProductInsertCommand.ExecuteNonQuery();

                    if (MyFlag == "y")
                    {
                        if (MyFlagSelect == "4")
                        {
                            if (Amt + mi_money > ye_money)
                            {
                                var MisuUpdateCommand1 = Connection.CreateCommand();
                                MisuUpdateCommand1.Transaction = mTransaction;
                                MisuUpdateCommand1.CommandText = MisuUpdateQuery1;
                                MisuUpdateCommand1.Parameters.AddWithValue("@Amt", SumAmt);
                                MisuUpdateCommand1.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                                MisuUpdateCommand1.ExecuteNonQuery();
                            }

                            else
                            {
                                var MisuUpdateCommand1 = Connection.CreateCommand();
                                MisuUpdateCommand1.Transaction = mTransaction;
                                MisuUpdateCommand1.CommandText = MisuUpdateQuery;
                                MisuUpdateCommand1.Parameters.AddWithValue("@Amt", SumAmt);
                                MisuUpdateCommand1.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                                MisuUpdateCommand1.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            var MisuUpdateCommand = Connection.CreateCommand();
                            MisuUpdateCommand.Transaction = mTransaction;
                            MisuUpdateCommand.CommandText = MisuUpdateQuery;
                            MisuUpdateCommand.Parameters.AddWithValue("@Amt", SumAmt);
                            MisuUpdateCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                            MisuUpdateCommand.ExecuteNonQuery();
                        }
                    }
                    mTransaction.Commit();
                }
                catch
                {
                    mTransaction.Rollback();
                    Connection.Close();
                    return r;
                }
            }

            r.IsSuccess = true;
            return r;
        }

        public AllowViewModel AllowOrderByTime(int BSubIdx)
        {
            AllowViewModel r = new AllowViewModel();

            var Query =
                @"SELECT timecheck1, timecheck2 FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var Reader = Command.ExecuteReader();
                if(Reader.Read())
                {
                    var timecheck1 = Reader.GetString(0);
                    var timecheck2 = Reader.GetString(1);
                    if (String.IsNullOrEmpty(timecheck1) || String.IsNullOrEmpty(timecheck2))
                        r.IsAllowed = true;
                    else
                    {
                        var hour1 = int.Parse(timecheck1.Substring(0, 2));
                        var hour2 = int.Parse(timecheck2.Substring(0, 2));
                        var minuet1 = int.Parse(timecheck1.Substring(2, 2));
                        var minuet2 = int.Parse(timecheck2.Substring(2, 2));
                        var fromtime = DateTime.Now.Date.AddHours(hour1).AddMinutes(minuet1);
                        var totime = DateTime.Now.Date.AddHours(hour2).AddMinutes(minuet2);

                      

                        var now_time =  int.Parse("1" + DateTime.Now.ToString("HHmm"));
                        var timecheck1_1 = int.Parse("1"+fromtime.ToString("HHmm"));
                        var timecheck2_2 = int.Parse("1"+totime.ToString("HHmm"));
                        var gijun_time1 = int.Parse("1" + DateTime.Now.ToString("2400"));
                        var gijun_time2 = int.Parse("1" + DateTime.Now.ToString("0000"));
                        if (timecheck1_1 < timecheck2_2)
                        {
                            if (DateTime.Now >= fromtime && DateTime.Now <= totime)
                            {
                                r.IsAllowed = false;
                                r.Message = String.Format("차단시간 : {0} ~ {1}", fromtime.ToString("HH:mm"), totime.ToString("HH:mm"));
                            }
                            else
                                r.IsAllowed = true;
                        }
                        else
                        {
                            if ((now_time >= timecheck1_1 && now_time <= gijun_time1) || (now_time >= gijun_time2 && now_time <= timecheck2_2))
                            {
                                r.IsAllowed = false;
                                r.Message = String.Format("차단시간 : {0} ~ {1}", fromtime.ToString("HH:mm"), totime.ToString("HH:mm"));
                            }
                            else
                                r.IsAllowed = true;
                        }
                        //if (DateTime.Now >= fromtime && DateTime.Now <= totime)
                        //{
                        //    r.IsAllowed = false;
                        //    r.Message = String.Format("차단시간 : {0} ~ {1}", fromtime.ToString("HH:mm"), totime.ToString("HH:mm"), DateTime.Now);
                        //}
                        //else
                        //    r.IsAllowed = true;

                        
                    }
                }
                Reader.Close();
            }


            return r;
        }

        public AllowViewModel AllowOrderByFlag(int Idx)
        {
            AllowViewModel r = new AllowViewModel();

            var Query =
                @"SELECT orderflag FROM tb_company WHERE idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var o = Command.ExecuteScalar();
                if(o != null)
                {
                    if (o.ToString() == "1")
                    {
                        r.IsAllowed = false;
                        r.Message = "'미수금' 관계로 주문을 하실 수 없습니다.";
                    }
                    else if (o.ToString() == "2")
                    {
                        r.IsAllowed = false;
                        r.Message = "'폐업' 관계로 주문을 하실 수 없습니다.";
                    }
                    else if (o.ToString() == "3")
                    {
                        r.IsAllowed = false;
                        r.Message = "'휴업' 관계로 주문을 하실 수 없습니다.";
                    }
                    else
                        r.IsAllowed = true;
                }
            }


            return r;
        }

        public AllowViewModel AllowOrderByWeek(int Idx)
        {
            AllowViewModel r = new AllowViewModel();

            var Query =
                @"SELECT order_weekgubun, order_weekchoice, order_checkStime, order_checkEtime FROM tb_company WHERE idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var Reader = Command.ExecuteReader();
                if(Reader.Read())
                {
                    var order_weekgubun = Reader.GetString(0);
                    if (order_weekgubun == "1")
                    {
                        r.IsAllowed = true;
                    }
                    else
                    {
                        r.IsAllowed = false;
                        var order_weekchoice = Reader.GetString(1);
                        var vorder_checkStime = Reader.GetString(2);
                        var vorder_checkEtime = Reader.GetString(3);
                        var order_checkStime = int.Parse(vorder_checkStime);
                        var order_checkEtime = int.Parse(vorder_checkEtime);
                        var nowtime = DateTime.Now.Hour * 100 + DateTime.Now.Minute;
                        if(nowtime >= order_checkStime)
                        {
                            var week = 0;
                            switch (DateTime.Now.DayOfWeek)
                            {
                                case DayOfWeek.Monday:
                                    week = 3;
                                    break;
                                case DayOfWeek.Tuesday:
                                    week = 4;
                                    break;
                                case DayOfWeek.Wednesday:
                                    week = 5;
                                    break;
                                case DayOfWeek.Thursday:
                                    week = 6;
                                    break;
                                case DayOfWeek.Friday:
                                    week = 7;
                                    break;
                                case DayOfWeek.Saturday:
                                    week = 1;
                                    break;
                                case DayOfWeek.Sunday:
                                    week = 2;
                                    break;
                                default:
                                    break;
                            }
                            if (order_weekchoice.Contains(week.ToString()))
                                r.IsAllowed = true;
                        }
                        if (nowtime <= order_checkEtime)
                        {
                            var week = 0;
                            switch (DateTime.Now.DayOfWeek)
                            {
                                case DayOfWeek.Monday:
                                    week = 2;
                                    break;
                                case DayOfWeek.Tuesday:
                                    week = 3;
                                    break;
                                case DayOfWeek.Wednesday:
                                    week = 4;
                                    break;
                                case DayOfWeek.Thursday:
                                    week = 5;
                                    break;
                                case DayOfWeek.Friday:
                                    week = 6;
                                    break;
                                case DayOfWeek.Saturday:
                                    week = 7;
                                    break;
                                case DayOfWeek.Sunday:
                                    week = 1;
                                    break;
                                default:
                                    break;
                            }
                            if (order_weekchoice.Contains(week.ToString()))
                                r.IsAllowed = true;
                        }
                        if(r.IsAllowed == false)
                        {
                            var week = String.Join("/", order_weekchoice.Select(c =>
                            {
                                if (c == '2')
                                {
                                    return "월";
                                }
                                if (c == '3')
                                {
                                    return "화";
                                }
                                if (c == '4')
                                {
                                    return "수";
                                }
                                if (c == '5')
                                {
                                    return "목";
                                }
                                if (c == '6')
                                {
                                    return "금";
                                }
                                if (c == '7')
                                {
                                    return "토";
                                }
                                if (c == '1')
                                {
                                    return "일";
                                }
                                return "";
                            }));
                            var time1 = vorder_checkStime.Substring(0, 2) + ":" + vorder_checkStime.Substring(2, 2);
                            var time2 = vorder_checkEtime.Substring(0, 2) + ":" + vorder_checkEtime.Substring(2, 2);
                            r.Message = String.Format("주문허용요일 : {0}<br>" + Environment.NewLine + "주문허용시간 : 전일 {1} ~ 당일 {2}", week, time1, time2);
                        }
                    }
                }
                Reader.Close();
            }
            return r;
        }

        public AllowViewModel AllowOrderByMisu(int Idx)
        {
            AllowViewModel r = new AllowViewModel();

            var Query =
                //  @"SELECT ye_money, mi_money FROM tb_company WHERE idx = @Idx";
              @"select a.ye_money, a.mi_money,b.myflag,b.myflag_select from tb_company a join tb_company b on b.idx = a.bidxsub WHERE a.idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var Reader = Command.ExecuteReader();
                if (Reader.Read())
                {
                    var ye_money = Reader.GetInt32(0);
                    var mi_money = Reader.GetInt32(1);
                    var myflag = Reader.GetString(2);
                    var myflag_select = Reader.GetString(3);

                    if(myflag == "y")
                    {
                       // if (myflag_select == "2")
                       // {
                            if (mi_money > ye_money)
                            {
                                r.IsAllowed = false;
                                r.Message = String.Format("여신금 : {0:N0}원<br>미수금 : {1:N0}원", ye_money, mi_money);
                            }
                            else
                            {
                                r.IsAllowed = true;

                            }
                       // }
                      //  else
                       // {
                     //       r.IsAllowed = true;
                      //  }
                       // r.IsMyFlag = true;
                    }
                    else
                    {
                       // r.IsMyFlag = false;
                        r.IsAllowed = true;
                    }
                }
                Reader.Close();
            }
            return r;
        }

        public byte[] Thumbnail(int ProductId)
        {
            byte[] r = null;

            var Query = "SELECT proimage FROM tb_product WHERE idx = @ProductId";


            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@ProductId", ProductId);
                var o = Command.ExecuteScalar();
                if(o != null)
                {
                    r = (byte[])o;
                }
            }

            return r;
        }

        #endregion

        #region OrderList

        public IEnumerable<OrderListItem> GetOrderListItems(String From, String To, String UserCode,String vatflag)
        {
            List<OrderListItem> r = new List<OrderListItem>();

//            var SelectQuery =
//                @"SELECT idx, orderday, rordermoney, flag, deflag, deflagday, ISNULL(wdate, N'')
//                FROM tb_order
//                WHERE usercode = @UserCode AND orderday >= @FromDate AND orderday <= @ToDate
//                ORDER BY idx DESC";

            var SelectQuery =
                @"select torder.idx,torder.orderday, rordermoney
                    , torder.flag, torder.deflag, torder.deflagday, ISNULL(torder.wdate, N'') 
                     from tb_order_product order_product
                     join tb_order torder on order_product.idx = torder.idx
                     join tb_product product on substring(torder.usercode, 1, 5) = product.usercode and order_product.pcode = product.pcode
                    join tb_company company on substring(torder.usercode, 1, 5) = company.idx
                     where torder.usercode = @UserCode AND orderday >= @FromDate AND orderday <= @ToDate

                    group by torder.idx,torder.orderday,torder.flag, torder.deflag, torder.deflagday,torder.wdate,torder.rordermoney
                    ORDER BY torder.idx DESC";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var SelectCommand = Connection.CreateCommand();
                SelectCommand.CommandText = SelectQuery;
                SelectCommand.Parameters.AddWithValue("@UserCode", UserCode);
                SelectCommand.Parameters.AddWithValue("@FromDate", From);
                SelectCommand.Parameters.AddWithValue("@ToDate", To);
                var SelectReader = SelectCommand.ExecuteReader();
                while (SelectReader.Read())
                {
                    var wdate = SelectReader.GetString(6);
                    var Added = new OrderListItem
                    {
                        OrderId = SelectReader.GetString(0),
                        OrderDate = SelectReader.GetString(1),
                        OrderAmt = SelectReader.GetInt64(2).ToString("N0"),
                        DeliveryDate = "",
                    };
                    
                    var flag = SelectReader.GetString(3);
                    var deflag = SelectReader.GetString(4);
                    if (deflag == "y")
                    {
                        var deflagday = SelectReader.GetString(5);
                        Added.DeliveryDate = deflagday;
                        if (Added.DeliveryDate.Length == 8)
                        {
                            Added.DeliveryDate = Added.DeliveryDate.Substring(0, 4) + "-" + Added.DeliveryDate.Substring(4, 2) + "-" + Added.DeliveryDate.Substring(6, 2);
                        }
                    }
                    else if (flag == "y")
                    {
                        Added.DeliveryDate = "주문마감";
                    }
                    var OrderDate = DateTime.Now;
                    if(DateTime.TryParse(wdate, out OrderDate))
                    {
                        Added.OrderDate = OrderDate.ToString("yyyy-MM-dd HH:mm:ss");
                    }
                    else
                    {
                        Added.OrderDate = Added.OrderDate.Substring(0, 4) + "-" + Added.OrderDate.Substring(4, 2) + "-" + Added.OrderDate.Substring(6, 2) + " 00:00:00";
                    }
                    Added.vatflag = vatflag;
                    r.Add(Added);
                }
                SelectReader.Close();
            }

            return r;
        }

        public OrderDetialViewModel GetOrderDetialViewModel(String CompanyName, String CompanyCode, String OrderId, String UserCode, String myflag, String myflag_select, String d_requestday,String vatflag)
        {
            var OrderQuery =
                @"SELECT idx, orderday, rordermoney, flag, deflag, ISNULL(wdate, N''),request_day
                FROM tb_order
                WHERE usercode = @UserCode AND idx = @OrderId";

            var OrderProductQuery =
                @"SELECT tb_order_product.pidx, tb_order_product.pcode, tb_order_product.pprice, tb_order_product.rordernum, tb_order_product.pname, tb_product.ptitle, tb_product.gubun
                FROM tb_order_product JOIN tb_product ON tb_order_product.pcodeidx = tb_product.idx
                WHERE tb_order_product.idx = @OrderId";

            OrderDetialViewModel r = null;

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var OrderCommand = Connection.CreateCommand();
                OrderCommand.CommandText = OrderQuery;
                OrderCommand.Parameters.AddWithValue("@UserCode", UserCode);
                OrderCommand.Parameters.AddWithValue("@OrderId", OrderId);
                var OrderReader = OrderCommand.ExecuteReader();
                if (OrderReader.Read())
                {
                    var wdate = OrderReader.GetString(5);
                    r = new OrderDetialViewModel();
                    r.CompanyName = CompanyName;
                    r.CompanyCode = CompanyCode;
                    r.OrderId = OrderReader.GetString(0);
                    r.OrderDate = OrderReader.GetString(1);
                    r.OrderAmt = OrderReader.GetInt64(2).ToString("N0");
                    var flag = OrderReader.GetString(3);
                    var deflag = OrderReader.GetString(4);
                    r.AllowEdit = false;
                    if (flag == "n" && deflag == "n")
                        r.AllowEdit = true;
                    if (r.OrderDate.Length == 8)
                    {
                        r.OrderDate = r.OrderDate.Substring(0, 4) + "-" + r.OrderDate.Substring(4, 2) + "-" + r.OrderDate.Substring(6, 2);
                    }
                    var OrderDate = DateTime.Now;
                    if (DateTime.TryParse(wdate, out OrderDate))
                    {
                        r.OrderDate = OrderDate.ToString("yyyy-MM-dd HH:mm:ss");
                    }
                    r.myflag = myflag;
                    r.myflag_select = myflag_select;
                    r.d_requestday = d_requestday;
                    r.vatflag = vatflag;
                 
                    if (OrderReader.GetString(6).Length == 8)
                    {
                        r.request_day = OrderReader.GetString(6).Substring(0, 4) + "-" + OrderReader.GetString(6).Substring(4, 2) + "-" + OrderReader.GetString(6).Substring(6, 2);
                    }
                    else if (OrderReader.GetString(6).Length == 4)
                    {
                        r.request_day = r.OrderDate.Substring(0, 4) + "-" + OrderReader.GetString(6).Substring(0, 2) + "-" + OrderReader.GetString(6).Substring(2, 2);
                      //  r.request_day = DateTime.Parse(OrderReader.GetString(6)).ToString("yyyy-MM-dd");
                    }
                    
                }
                OrderReader.Close();
                if (r != null)
                {
                    r.CartItems = new List<CartItem>();
                    var OrderProductCommand = Connection.CreateCommand();
                    OrderProductCommand.CommandText = OrderProductQuery;
                    OrderProductCommand.Parameters.AddWithValue("@OrderId", OrderId);
                    var OrderProductReader = OrderProductCommand.ExecuteReader();
                    while (OrderProductReader.Read())
                    {
                        var Added = new CartItem
                        {
                            Id = OrderProductReader.GetInt32(0),
                            ProductCode = OrderProductReader.GetString(1),
                            ProductPrice = OrderProductReader.GetInt64(2),
                            Count = OrderProductReader.GetInt32(3),
                            ProductName = OrderProductReader.GetString(4),
                            ProductUnit = OrderProductReader.GetString(5),
                            HasTax = OrderProductReader.GetString(6) == "과세",
                            
                        };

                        if (Added.HasTax)
                        {
                            Added.Tax = (int)Math.Round(((double)(Added.ProductPrice * Added.Count) / 11d));
                        }
                        else
                        {
                            Added.Tax = 0;
                        }
                        Added.Amt = Added.ProductPrice * Added.Count - Added.Tax;

                        r.CartItems.Add(Added);
                    }
                    OrderProductReader.Close();
                }
            }

            return r;
        }

        public bool CancelOrder(int CompanyIdx, string OrderIdx, string UserCode,string myflag)
        {
            var AmtQuery =
                @"select rordermoney
                    from tb_order
                    where idx = @OrderIdx and usercode = @UserCode and flag = 'n' and deflag = 'n'";

            var NewAmtQuery =
                @"select sum(
                case product.gubun when '과세' then
	                case company.vatflag when 'n' then	
		                 (product.pprice * order_product.rordernum*1.1)
	                else product.pprice * order_product.rordernum end
                else  
	                product.pprice * order_product.rordernum
                end
                )
                 from tb_order_product order_product
                 join tb_order torder on order_product.idx = torder.idx
                 join tb_product product on substring(torder.usercode, 1, 5) = product.usercode and order_product.pcode = product.pcode
                join tb_company company on substring(torder.usercode, 1, 5) = company.idx
                 where torder.usercode = @UserCode and torder.idx = @OrderIdx
                 and torder.flag = 'n' and torder.deflag = 'n'";
            var OrderUpdateQuery =
                @"update [tb_order] 
                set rordermoney = 0
                where idx = @OrderIdx and usercode = @UserCode";
            var ProductUpdateQuery =
                @"update tb_order_product 
                set rordernum = 0
                where idx = @OrderIdx";

            var  MisuUpdateQuery =
                    @"update tb_company set mi_money = mi_money - @SumAmt where idx = @CompanyIdx";
          
            
            var Amt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var AmtCommand = Connection.CreateCommand();
                AmtCommand.CommandText = AmtQuery;
                AmtCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                AmtCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var o = AmtCommand.ExecuteScalar();
                if (o != null)
                {
                    Amt = Convert.ToInt32(o);
                }
                else
                {
                    return false;
                }
            }
            var NewAmt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var NewAmtCommand = Connection.CreateCommand();
                NewAmtCommand.CommandText = NewAmtQuery;
                NewAmtCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                NewAmtCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var o = NewAmtCommand.ExecuteScalar();
                if (o != null)
                {
                    NewAmt = Convert.ToInt32(o);
                }
                else
                {
                    return false;
                }
            }
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var mTransaction = Connection.BeginTransaction();
                try
                {
                    var OrderUpdateCommnad = Connection.CreateCommand();
                    OrderUpdateCommnad.Transaction = mTransaction;
                    OrderUpdateCommnad.CommandText = OrderUpdateQuery;
                    OrderUpdateCommnad.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                    OrderUpdateCommnad.Parameters.AddWithValue("@UserCode", UserCode);
                    OrderUpdateCommnad.ExecuteNonQuery();
                    var OrderProductUpdateCommand = Connection.CreateCommand();
                    OrderProductUpdateCommand.Transaction = mTransaction;
                    OrderProductUpdateCommand.CommandText = ProductUpdateQuery;
                    OrderProductUpdateCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                    OrderProductUpdateCommand.ExecuteNonQuery();

                    if (myflag == "y")
                    {

                        
                        var MisuUpdateCommand = Connection.CreateCommand();
                        MisuUpdateCommand.Transaction = mTransaction;
                        MisuUpdateCommand.CommandText = MisuUpdateQuery;
                        MisuUpdateCommand.Parameters.AddWithValue("@SumAmt", NewAmt);
                        MisuUpdateCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                        MisuUpdateCommand.ExecuteNonQuery();
                    }
                    mTransaction.Commit();
                }
                catch
                {
                    mTransaction.Rollback();
                    Connection.Close();
                    return false;
                }
            }

            return true;
        }

        public bool UpdateOrder(int CompanyIdx, string OrderIdx, string UserCode, IEnumerable<CartItem> CartItems, string myflag, String d_request_day, String request_day, string MyFlagSelect)
        {
            var PreAmtQuery =
                @"select rordermoney
                    from tb_order
                    where idx = @OrderIdx and usercode = @UserCode and flag = 'n' and deflag = 'n'";

            var NewPreAmtQuery =
                @"select sum(
                case product.gubun when '과세' then
	                case company.vatflag when 'n' then	
		                 (product.pprice * order_product.rordernum*1.1)
	                else product.pprice * order_product.rordernum end
                else  
	                product.pprice * order_product.rordernum
                end
                )
                 from tb_order_product order_product
                 join tb_order torder on order_product.idx = torder.idx
                 join tb_product product on substring(torder.usercode, 1, 5) = product.usercode and order_product.pcode = product.pcode
                join tb_company company on substring(torder.usercode, 1, 5) = company.idx
                 where torder.usercode = @UserCode and torder.idx = @OrderIdx
                 and torder.flag = 'n' and torder.deflag = 'n'";


            var UseMoneyQuery =
                @"select ye_money - mi_money from tb_company where idx = @CompanyIdx";

            var UseMoneyQuery2 =
               @"select ye_money ,mi_money from tb_company where idx = @CompanyIdx";
            var OrderUpdateQuery =
                @"update [tb_order] 
                set rordermoney = @Amt
                ,request_day = @request_day
                where idx = @OrderIdx and usercode = @UserCode";
            var ProductUpdateQuery =
                @"update tb_order_product 
                set rordernum = @rCount
                where idx = @OrderIdx and pidx = @Id";
            var MisuUpdateQuery =
                   @"update tb_company set mi_money = mi_money + @NewAmt - @PreAmt where idx = @CompanyIdx";

            var MisuUpdateQuery1 =
                 @"update tb_company set mi_money = mi_money + @NewAmt - @PreAmt,ye_money = ye_money*2 where idx = @CompanyIdx";

            var Amt = CartItems.Sum(c => c.Amt + c.Tax);
            var NewAmt = CartItems.Sum(c => c.NewAmt + c.NewTax);
            
        //    var PAmt = CartItems.Sum(c => c.Amt + c.Tax);


            //여기서 주문 수정 여부를 판단한다.
            var UseMoney = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var UseMoneyCommand = Connection.CreateCommand();
                if (myflag == "y")
                {
                    UseMoneyCommand.CommandText = UseMoneyQuery;
                
                UseMoneyCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                var o = UseMoneyCommand.ExecuteScalar();
                if (o != null)
                {
                    UseMoney = Convert.ToInt32(o);
                }
                else
                    return false;
                }
            }

            var PreAmt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var PreAmtCommand = Connection.CreateCommand();
                PreAmtCommand.CommandText = PreAmtQuery;
                PreAmtCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                PreAmtCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var o = PreAmtCommand.ExecuteScalar();
                if (o != null)
                {
                    PreAmt = Convert.ToInt32(o);
                }
                else
                {
                    return false;
                }
            }

            var newPreAmt = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var newPreAmtCommand = Connection.CreateCommand();
                newPreAmtCommand.CommandText = NewPreAmtQuery;
                newPreAmtCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                newPreAmtCommand.Parameters.AddWithValue("@UserCode", UserCode);
                var o = newPreAmtCommand.ExecuteScalar();
                if (o != null)
                {
                    newPreAmt = Convert.ToInt32(o);
                }
                else
                {
                    return false;
                }
            }

            var UseMoney1 = 0;
            var ye_money1 = 0;
            var mi_money1 = 0;
            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var UseMoneyCommand1 = Connection.CreateCommand();
                UseMoneyCommand1.CommandText = UseMoneyQuery2;
                UseMoneyCommand1.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                var UseMoneyReader1 = UseMoneyCommand1.ExecuteReader();
                if (UseMoneyReader1.Read())
                {
                    ye_money1 = UseMoneyReader1.GetInt32(0);
                    mi_money1 = UseMoneyReader1.GetInt32(1);
                    UseMoney1 = ye_money1 - mi_money1;
                }
                else
                {
                    return false;
                }
                UseMoneyReader1.Close();

            }

            //if (myflag == "y")
            //{
            //    if (MyFlagSelect == "1")
            //    {
            //        if ((Amt - newPreAmt) > UseMoney)
            //            return false;
            //        //if ((mi_money1 - newPreAmt + NewAmt) > ye_money1)
            //        //{
            //        //    return false;
            //        //}
            //    }
            //}


            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var mTransaction = Connection.BeginTransaction();
                try
                {
                    var OrderUpdateCommnad = Connection.CreateCommand();
                    OrderUpdateCommnad.Transaction = mTransaction;
                    OrderUpdateCommnad.CommandText = OrderUpdateQuery;
                    OrderUpdateCommnad.Parameters.AddWithValue("@Amt", Amt);
                    OrderUpdateCommnad.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                    OrderUpdateCommnad.Parameters.AddWithValue("@UserCode", UserCode);
                    if (d_request_day == "y")
                    {

                        OrderUpdateCommnad.Parameters.AddWithValue("@request_day", request_day.Substring(5, 2).ToString() + request_day.Substring(8, 2).ToString());
                    }
                    else
                    {
                        OrderUpdateCommnad.Parameters.AddWithValue ("@request_day", String.Format("{0:yyyyMMdd}", DateTime.Now.AddDays(1)));
                    }
                   // OrderUpdateCommnad.Parameters.AddWithValue("@request_day", request_day);
                    OrderUpdateCommnad.ExecuteNonQuery();
                    foreach (var mCartItem in CartItems)
                    {
                        var OrderProductUpdateCommand = Connection.CreateCommand();
                        OrderProductUpdateCommand.Transaction = mTransaction;
                        OrderProductUpdateCommand.CommandText = ProductUpdateQuery;
                        OrderProductUpdateCommand.Parameters.AddWithValue("@rCount", mCartItem.Count);
                        OrderProductUpdateCommand.Parameters.AddWithValue("@OrderIdx", OrderIdx);
                        OrderProductUpdateCommand.Parameters.AddWithValue("@Id", mCartItem.Id);
                        OrderProductUpdateCommand.ExecuteNonQuery();
                    }
                    if (myflag == "y")
                    {
                        if (MyFlagSelect == "4")
                        {

                            //현재미수금(주문금액+미수금) > 여신금액보다클때)
                            if ((mi_money1 - newPreAmt + NewAmt) > ye_money1)
                            {
                                var MisuUpdateCommand = Connection.CreateCommand();
                                MisuUpdateCommand.Transaction = mTransaction;
                                MisuUpdateCommand.CommandText = MisuUpdateQuery1;
                                MisuUpdateCommand.Parameters.AddWithValue("@NewAmt", NewAmt);
                                MisuUpdateCommand.Parameters.AddWithValue("@PreAmt", newPreAmt);
                                MisuUpdateCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                                MisuUpdateCommand.ExecuteNonQuery();
                            }

                            else
                            {
                                var MisuUpdateCommand = Connection.CreateCommand();
                                MisuUpdateCommand.Transaction = mTransaction;
                                MisuUpdateCommand.CommandText = MisuUpdateQuery;
                                MisuUpdateCommand.Parameters.AddWithValue("@NewAmt", NewAmt);
                                MisuUpdateCommand.Parameters.AddWithValue("@PreAmt", newPreAmt);
                                MisuUpdateCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                                MisuUpdateCommand.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            var MisuUpdateCommand = Connection.CreateCommand();
                            MisuUpdateCommand.Transaction = mTransaction;
                            MisuUpdateCommand.CommandText = MisuUpdateQuery;
                            MisuUpdateCommand.Parameters.AddWithValue("@NewAmt", NewAmt);
                            MisuUpdateCommand.Parameters.AddWithValue("@PreAmt", newPreAmt);
                            MisuUpdateCommand.Parameters.AddWithValue("@CompanyIdx", CompanyIdx);
                            MisuUpdateCommand.ExecuteNonQuery();
                        }
                    }
                    mTransaction.Commit();
                }
                catch
                {
                    mTransaction.Rollback();
                    Connection.Close();
                    return false;
                }
            }
            return true;
        }

        #endregion

        #region InputList

        public IEnumerable<InputListItemViewModel> GetInputListItems(int Idx, String Code, String From, String To, String cyberNum)
        {
            List<InputListItemViewModel> r = new List<InputListItemViewModel>();

            var Query =
                @"SELECT va.tr_il, va.tr_si, va.cust_nm, va.dep_amt, va.ye_money, va.mi_money, va.va_no
                FROM tb_virtual_acnt va JOIN tb_company BSub ON va.cporg_cd = BSub.cporg_cd
                JOIN tb_company Company ON Company.bidxsub = BSub.idx
                WHERE Company.idx = @Idx AND va.chancode = @Code AND va.tr_il >= @FromDate AND va.tr_il <= @ToDate
                ORDER BY va.tr_il DESC, va.tr_si DESC";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                Command.Parameters.AddWithValue("@Code", Code);
                Command.Parameters.AddWithValue("@FromDate", From);
                Command.Parameters.AddWithValue("@ToDate", To);
                var Reader = Command.ExecuteReader();
                while (Reader.Read())
                {
                    var vDate = DateTime.ParseExact(Reader.GetString(0) + Reader.GetString(1), "yyyyMMddHHmmss", null);
                    var Added = new InputListItemViewModel
                    {
                        Date = Reader.GetString(0) + Reader.GetString(1),
                        Name = Reader.GetString(2),
                        Amt = int.Parse( Reader.GetString(3)).ToString("N0"),
                        Yeosin = Reader.GetInt32(4),
                        Misu = Reader.GetInt32(5),
                        AccountNo = Reader.GetString(6),
                    };
                    Added.Date = vDate.ToString("yyyy-MM-dd").Replace("-", "/");
                    Added.Time = vDate.ToString("hh:mm:ss");
                    if (Added.Yeosin < Added.Misu)
                        Added.Gubun = "차단";
                    else
                        Added.Gubun = "허용";

                    r.Add(Added);
                }
            }

            return r;
        }

        public String GetcyberNum(int BSubIdx)
        {
            String r = "";

            var Query =
                @"SELECT cyberNum FROM tb_company WHERE idx = @BSubIdx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@BSubIdx", BSubIdx);
                var o = Command.ExecuteScalar();
                if (o != null && !string.IsNullOrEmpty(o.ToString().Trim()))
                    r = o.ToString();
            }

            return r;
        }
        #endregion

        #region Setting

        public SettingViewModel GetSettingViewModel(int Idx)
        {
            SettingViewModel r = null;

            var Query =
                @"SELECT  ISNULL(virtual_acnt_bank, ''), ISNULL(virtual_acnt, ''), ISNULL(virtual_acnt2_bank, ''), ISNULL(virtual_acnt2, ''), ISNULL(virtual_acnt3_bank, ''), ISNULL(virtual_acnt3, ''), ISNULL(virtual_acnt4_bank, ''), ISNULL(virtual_acnt4, ''), ISNULL(virtual_acnt5_bank, ''), ISNULL(virtual_acnt5, ''), ISNULL(virtual_acnt6_bank, ''), ISNULL(virtual_acnt6, ''), soundfile, hp1 + hp2 + hp3, email
                FROM tb_company
                where idx = @Idx";

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Idx", Idx);
                var Reader = Command.ExecuteReader();
                if(Reader.Read())
                {
                    r = new SettingViewModel();
                    r.VirtualAccounts = new List<string>();

                    var vAccount1 = String.Format("{0} ({1})", Reader.GetString(0), Reader.GetString(1));
                    var vAccount2 = String.Format("{0} ({1})", Reader.GetString(2), Reader.GetString(3));
                    var vAccount3 = String.Format("{0} ({1})", Reader.GetString(4), Reader.GetString(5));
                    var vAccount4 = String.Format("{0} ({1})", Reader.GetString(6), Reader.GetString(7));
                    var vAccount5 = String.Format("{0} ({1})", Reader.GetString(8), Reader.GetString(9));
                    var vAccount6 = String.Format("{0} ({1})", Reader.GetString(10), Reader.GetString(11));

                    int i = 1;

                    if (!String.IsNullOrEmpty(vAccount1.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount1));
                        i++;
                    }
                    if (!String.IsNullOrEmpty(vAccount2.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount2));
                        i++;
                    }
                    if (!String.IsNullOrEmpty(vAccount3.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount3));
                        i++;
                    }
                    if (!String.IsNullOrEmpty(vAccount4.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount4));
                        i++;
                    }
                    if (!String.IsNullOrEmpty(vAccount5.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount5));
                        i++;
                    }
                    if (!String.IsNullOrEmpty(vAccount6.Replace(" ", "").Replace("(", "").Replace(")", "")))
                    {
                        r.VirtualAccounts.Add(String.Format("{0}. {1}", i, vAccount6));
                        i++;
                    }


                    r.Password = Reader.GetString(12);
                    r.PhoneNo = Reader.GetString(13);
                    r.Email = Reader.GetString(14);
                }
            }

            return r;
        }

        public bool UpdateSettingViewModel(int Idx, SettingViewModel Value)
        {
            bool r = false;

            if (Value.Password == null)
                Value.Password = "";
            if (Value.PhoneNo == null)
                Value.PhoneNo = "";
            if (Value.Email == null)
                Value.Email = "";

            var Query =
                @"UPDATE  tb_company
                SET soundfile = @Password, hp1 = @PhoneNo1 , hp2 = @PhoneNo2 , hp3 = @PhoneNo3 , email = @Email
                where idx = @Idx";

            Value.PhoneNo = Value.PhoneNo.Replace("-", "").Trim();

            var PhoneNo1 = "";
            var PhoneNo2 = "";
            var PhoneNo3 = "";

            if (Value.PhoneNo.Length >= 10)
            {
                PhoneNo1 = Value.PhoneNo.Substring(0, 3);
                PhoneNo2 = Value.PhoneNo.Substring(3, Value.PhoneNo.Length - 7);
                PhoneNo3 = Value.PhoneNo.Substring(Value.PhoneNo.Length - 4, 4);
            }

            using (SqlConnection Connection = new SqlConnection(ConnectionString))
            {
                Connection.Open();
                var Command = Connection.CreateCommand();
                Command.CommandText = Query;
                Command.Parameters.AddWithValue("@Password", Value.Password);
                Command.Parameters.AddWithValue("@PhoneNo1", PhoneNo1);
                Command.Parameters.AddWithValue("@PhoneNo2", PhoneNo2);
                Command.Parameters.AddWithValue("@PhoneNo3", PhoneNo3);
                Command.Parameters.AddWithValue("@Email", Value.Email);
                Command.Parameters.AddWithValue("@Idx", Idx);
                Command.ExecuteNonQuery();
                r = true;
            }

            return r;
        }

        #endregion

    }
}