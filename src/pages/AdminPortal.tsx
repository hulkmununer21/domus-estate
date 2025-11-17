import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  Settings,
  DollarSign,
  FileText,
  MessageSquare,
  Activity,
  Bell,
  User,
  LogOut,
  Calendar,
  ClipboardList,
  Briefcase,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

const MANAGEMENT_LINKS = [
  { icon: Home, label: "Properties", count: "124", to: "/admin-properties" },
  { icon: Home, label: "Units", count: "124", to: "/admin-units" },
  { icon: Users, label: "Lodgers", count: "98", to: "/admin-lodgers" },
  { icon: Users, label: "Landlords", count: "45", to: "/admin-landlords" },
  { icon: Users, label: "Staff", count: "24", to: "/admin-staff" },
  { icon: FileText, label: "Documents", count: "342", to: "/admin-documents" },
  { icon: MessageSquare, label: "Messages", count: "18", to: "/admin-messages" },
  { icon: DollarSign, label: "Payments", count: "1,250", to: "/admin-payments" },
  { icon: Calendar, label: "Schedules", count: "32", to: "/admin-schedules" },
  { icon: ClipboardList, label: "Requests", count: "21", to: "/admin-requests" },
  { icon: Settings, label: "System Settings", count: "", to: "/admin-settings" },
  { icon: Briefcase, label: "Finance", count: "£125K", to: "/admin-finance" },
  { icon: Send, label: "Campaign", count: "", to: "/admin-campaign" }, // Added campaign
];

const AdminPortal = () => {
  const { logout } = useAuth();

  return (
    <>
      <SEO
        title="Admin Portal - Domus Servitia"
        description="Administrative control panel for managing users, properties, staff, financial reports, and system settings."
        canonical="https://domusservitia.co.uk/admin-portal"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Complete platform management and oversight
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Properties
                    </p>
                    <p className="text-2xl font-bold text-foreground">124</p>
                    <p className="text-xs text-green-600 mt-1">+12% this month</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Home className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Lodgers
                    </p>
                    <p className="text-2xl font-bold text-foreground">98</p>
                    <p className="text-xs text-green-600 mt-1">+8% this month</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-foreground">£125K</p>
                    <p className="text-xs text-green-600 mt-1">+15% this month</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Active Staff
                    </p>
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-xs text-muted-foreground mt-1">8 online now</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Management Tools Section with Links */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Management Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {MANAGEMENT_LINKS.map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="h-24 flex flex-col items-center justify-center gap-2 border border-border rounded-lg hover:bg-accent/10 hover:border-accent transition-all"
                      >
                        <item.icon className="h-6 w-6 text-accent" />
                        <div className="text-center">
                          <p className="font-medium text-sm">{item.label}</p>
                          {item.count && (
                            <p className="text-xs text-muted-foreground">
                              {item.count}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        action: "New lodger registered",
                        user: "John Smith",
                        time: "5 minutes ago",
                        type: "success",
                      },
                      {
                        action: "Property added",
                        user: "Admin",
                        time: "1 hour ago",
                        type: "info",
                      },
                      {
                        action: "Payment received",
                        user: "Sarah Johnson - £750",
                        time: "2 hours ago",
                        type: "success",
                      },
                      {
                        action: "Complaint submitted",
                        user: "Mike Brown",
                        time: "3 hours ago",
                        type: "warning",
                      },
                      {
                        action: "Maintenance completed",
                        user: "Staff Member",
                        time: "4 hours ago",
                        type: "success",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "success"
                              ? "bg-green-500"
                              : activity.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Revenue (Dec)
                        </p>
                        <p className="text-2xl font-bold">£125,450</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">
                          +15.3%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          vs last month
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Collected
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          £118,200
                        </p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Pending
                        </p>
                        <p className="text-xl font-bold text-yellow-600">
                          £7,250
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* System Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>System Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-gold text-primary font-semibold">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                  <Link to="/admin-campaign" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Email Campaign
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border border-border rounded-lg">
                      <p className="text-sm font-medium mb-1">
                        Lodging Requests
                      </p>
                      <p className="text-2xl font-bold text-accent mb-2">12</p>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Review →
                      </Button>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <p className="text-sm font-medium mb-1">
                        Staff Accounts
                      </p>
                      <p className="text-2xl font-bold text-accent mb-2">3</p>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Review →
                      </Button>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <p className="text-sm font-medium mb-1">
                        Property Listings
                      </p>
                      <p className="text-2xl font-bold text-accent mb-2">5</p>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Review →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <span className="text-xs text-green-600 font-medium">
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Gateway</span>
                      <span className="text-xs text-green-600 font-medium">
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Service</span>
                      <span className="text-xs text-green-600 font-medium">
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup System</span>
                      <span className="text-xs text-green-600 font-medium">
                        Last: 2h ago
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPortal;

