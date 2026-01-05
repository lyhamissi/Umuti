import { Card, CardContent } from "../components/ui/card";
import { Users, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../components/LanguageSwitcher";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t("howToUse")} <span className="text-gradient">UMUTI</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("aboutDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Users */}
            <Card className="border-primary/20">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">{t("forUsers")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("forUsersDesc")}
                </p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                    <div>
                      <p className="font-medium">{t("step1User")}</p>
                      <p className="text-sm text-muted-foreground">{t("step1UserDesc")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                    <div>
                      <p className="font-medium">{t("step2User")}</p>
                      <p className="text-sm text-muted-foreground">{t("step2UserDesc")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                    <div>
                      <p className="font-medium">{t("step3User")}</p>
                      <p className="text-sm text-muted-foreground">{t("step3UserDesc")}</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* For Pharmacists */}
            <Card className="border-primary/20">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold">{t("forPharmacists")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("forPharmacistsDesc")}
                </p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                    <div>
                      <p className="font-medium">{t("step1Pharmacist")}</p>
                      <p className="text-sm text-muted-foreground">{t("step1PharmacistDesc")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                    <div>
                      <p className="font-medium">{t("step2Pharmacist")}</p>
                      <p className="text-sm text-muted-foreground">{t("step2PharmacistDesc")}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                    <div>
                      <p className="font-medium">{t("step3Pharmacist")}</p>
                      <p className="text-sm text-muted-foreground">{t("step3PharmacistDesc")}</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
