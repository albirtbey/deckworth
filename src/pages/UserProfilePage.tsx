import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { User as UserType } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Briefcase, CalendarDays, Gift, MapPin, Medal, TrendingUp, UserCheck, Users, Zap, CheckCircle, PlusCircle, Edit3, BarChart3, ShieldCheck, Star, DollarSign, Clock, Edit, Shield, Trophy, Award, Package, MessageSquare, Repeat, UserPlus, Coins, Gem, LogOut } from 'lucide-react';

interface UserProfilePageProps {
  currentUser: UserType | null;
  onLogout: () => void;
  // We might need a way to fetch other users' profiles later
}

// Helper to determine XP needed for next level (example logic)
const xpForNextLevel = (level: number): number => {
  return 500 + (level * 250); // e.g. Level 1 -> 750, Level 5 -> 1750
};


export function UserProfilePage({ currentUser, onLogout }: UserProfilePageProps) {
  // For now, this page only shows the logged-in user's profile.
  // Later, we might want to view other users' profiles via /profile/:userId
  // const { userId } = useParams(); 

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const user = currentUser; // For clarity, using 'user' for the profile being displayed
  const nextLevelXp = xpForNextLevel(user.level);
  const currentXpProgress = (user.xp / nextLevelXp) * 100;

  // Mock data for achievements, collector progress, and level benefits based on the image
  const achievements = [
    { name: "Kanto Starter", date: "Earned on January 15, 2023", icon: <Zap className="w-8 h-8 text-yellow-500" /> },
    { name: "Trading Novice", date: "Earned on February 20, 2023", icon: <Repeat className="w-8 h-8 text-blue-500" /> },
    { name: "Collection Master", date: "Collect 100+ items", icon: <Package className="w-8 h-8 text-gray-400" /> },
    { name: "High Roller", date: "Have a collection worth $10,000+", icon: <DollarSign className="w-8 h-8 text-green-500" /> },
  ];

  const collectorProgressItems = [
    { title: "Add to Collection", xp: "+10 XP per item", icon: <PlusCircle className="w-6 h-6 text-blue-600" /> },
    { title: "Complete a Trade", xp: "+50 XP per trade", icon: <CheckCircle className="w-6 h-6 text-green-600" /> },
    { title: "Update Item Details", xp: "+5 XP per update", icon: <Edit3 className="w-6 h-6 text-purple-600" /> },
    { title: "Daily Login", xp: "+5 XP per day", icon: <CalendarDays className="w-6 h-6 text-orange-600" /> },
  ];

  const levelBenefits = [
    { level: 1, benefit: "Beginner Collector", achieved: user.level >= 1 },
    { level: 3, benefit: "Unlock Trade Hub", achieved: user.level >= 3 },
    { level: 5, benefit: "Enthusiast Badge", achieved: user.level >= 5 },
    { level: 10, benefit: "Expert Collector Status", achieved: user.level >= 10 },
    { level: 25, benefit: "Master Collector Status", achieved: user.level >= 25 },
  ];


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-foreground">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-primary text-primary-foreground p-6 rounded-t-lg">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20 border-4 border-primary-foreground">
                  <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
                  <AvatarFallback className="text-2xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.username}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-muted-foreground">Collector Level {user.level}</p>
                  <p className="text-sm font-medium text-muted-foreground">{user.xp} XP / {nextLevelXp} XP</p>
                </div>
                <Progress value={currentXpProgress} className="w-full h-3" />
                <p className="text-xs text-muted-foreground mt-1">{nextLevelXp - user.xp} XP to level {user.level + 1}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <Package className="w-6 h-6 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Collection Size</p>
                  <p className="text-lg font-semibold">{user.collectionSize} items</p>
                </div>
                <div>
                  <Repeat className="w-6 h-6 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Completed Trades</p>
                  <p className="text-lg font-semibold">{user.completedTrades} trades</p>
                </div>
                <div>
                  <DollarSign className="w-6 h-6 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Collection Value</p>
                  <p className="text-lg font-semibold">${user.collectionValue.toFixed(2)}</p>
                </div>
              </div>
              
              <Separator />
              
              {user.bio && (
                <div>
                    <h4 className="text-sm font-semibold mb-1 text-foreground">Bio</h4>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
               {user.location && (
                <div>
                    <h4 className="text-sm font-semibold mb-1 text-foreground">Location</h4>
                    <p className="text-sm text-muted-foreground"><MapPin className="inline w-4 h-4 mr-1 text-muted-foreground"/>{user.location}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">Joined</h4>
                <p className="text-sm text-muted-foreground"><CalendarDays className="inline w-4 h-4 mr-1 text-muted-foreground"/>{new Date(user.joinDate).toLocaleDateString()}</p>
              </div>
               <div>
                <h4 className="text-sm font-semibold mb-1 text-foreground">Reputation</h4>
                <div className="flex items-center">
                    <Star className="inline w-4 h-4 mr-1 text-yellow-400"/>
                    <p className="text-sm text-muted-foreground">{user.reputation} <span className="text-xs">(placeholder)</span></p>
                </div>
              </div>


            </CardContent>
            <CardFooter className="p-6 flex flex-col space-y-3">
              <Button className="w-full" variant="default">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button className="w-full" variant="outline" onClick={onLogout}> 
                <LogOut className="w-4 h-4 mr-2" /> Log Out
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Achievements, Progress, Benefits */}
        <div className="lg:col-span-2 space-y-8">
          {/* Achievements & Badges */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Trophy className="w-6 h-6 mr-2 text-yellow-500" />Achievements & Badges</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.achievements.length > 0 ? user.achievements.map((ach) => (
                <div key={ach.id} className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3">
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md text-white">
                    {/* Using a generic icon for now, will map ach.icon later */}
                    <Award className="w-6 h-6" /> 
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{ach.name}</h4>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                    <p className="text-xs text-muted-foreground">Earned: {new Date(ach.dateEarned).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground col-span-full">No achievements yet. Keep trading and collecting!</p>}
              {/* Displaying mock achievements for visual consistency with image if user has few */}
              {user.achievements.length < 2 && achievements.slice(user.achievements.length).map((ach, index) => (
                 <div key={`mock-ach-${index}`} className="bg-muted/50 p-4 rounded-lg flex items-start space-x-3 opacity-60">
                    <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-400 dark:text-gray-500">
                        {ach.icon}
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">{ach.name}</h4>
                        <p className="text-xs text-muted-foreground">{ach.date}</p>
                    </div>
                 </div>
              ))}
            </CardContent>
          </Card>

          {/* Collector Progress */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><BarChart3 className="w-6 h-6 mr-2 text-indigo-500" />Collector Progress</CardTitle>
              <CardDescription>How to Earn XP</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collectorProgressItems.map((item, index) => (
                <div key={index} className="bg-muted/50 p-4 rounded-lg flex items-center space-x-3">
                  <div className="p-2 bg-background rounded-full border shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="text-sm text-green-500 font-medium">{item.xp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Level Benefits */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><ShieldCheck className="w-6 h-6 mr-2 text-green-500" />Level Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {levelBenefits.map((lb, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-semibold ${lb.achieved ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground border'}`}>
                      {lb.achieved ? <CheckCircle size={18} /> : lb.level}
                    </div>
                    <span className={`font-medium ${lb.achieved ? 'text-foreground' : 'text-muted-foreground'}`}>{lb.benefit}</span>
                  </div>
                  {lb.achieved && <Star className="w-5 h-5 text-yellow-400" />}
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
} 