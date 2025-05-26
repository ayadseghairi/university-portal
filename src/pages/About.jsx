"use client"

import { useTranslation } from "react-i18next"
import { Users, Target, Award, Globe } from "lucide-react"

const About = () => {
  const { t, i18n } = useTranslation()

  const values = [
    {
      icon: Target,
      title: i18n.language === "ar" ? "الرؤية" : "Vision",
      description:
        i18n.language === "ar"
          ? "أن نكون جامعة رائدة في التعليم العالي والبحث العلمي على المستوى الوطني والإقليمي"
          : "To be a leading university in higher education and scientific research at national and regional levels",
    },
    {
      icon: Award,
      title: i18n.language === "ar" ? "الرسالة" : "Mission",
      description:
        i18n.language === "ar"
          ? "تقديم تعليم عالي الجودة وإجراء بحوث علمية متميزة لخدمة المجتمع والتنمية المستدامة"
          : "Providing high-quality education and conducting outstanding scientific research to serve society and sustainable development",
    },
    {
      icon: Users,
      title: i18n.language === "ar" ? "القيم" : "Values",
      description:
        i18n.language === "ar"
          ? "التميز الأكاديمي، النزاهة، الابتكار، والمسؤولية المجتمعية"
          : "Academic excellence, integrity, innovation, and social responsibility",
    },
    {
      icon: Globe,
      title: i18n.language === "ar" ? "الانفتاح" : "Openness",
      description:
        i18n.language === "ar"
          ? "التعاون مع الجامعات العالمية وتبادل الخبرات والمعرفة"
          : "Collaboration with international universities and exchange of expertise and knowledge",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-university-blue text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("about.title")}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "جامعة خنشلة، مؤسسة تعليمية رائدة تأسست لتكون منارة للعلم والمعرفة في قلب الجزائر"
                : "University of Khenchela, a leading educational institution established to be a beacon of science and knowledge in the heart of Algeria"}
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("about.history")}</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  {i18n.language === "ar"
                    ? "في قلب منطقة الأوراس ، تعتبر جامعة خنشلة مشروعًا مبتكرًا متعدد التخصصات. . تضم الجامعة الآن أكثر من 18000 طالبا يؤطرهم 705 استاذا و 500 موظف إداري و تقني موزعين على ست كليات : كلية العلوم والتكنولوجيا ، كلية العلوم الإنسانية والاجتماعية ، كلية العلوم الاقتصادية ، التجارية وعلوم التسيير ، كلية علوم الطبيعة والحياة ، كلية الآداب واللغات ، كلية الحقوق والعلوم السياسية. تقيس الجامعة أداءها من خلال تأثيرها على محيطها من خلال المشاركة في تكوين الأساتذة والباحثين والاطارات لفائدة الإدارات والشركات."
                    : "In the heart of the Aures region, Khenchela University is an innovative multidisciplinary project. The university now has more than 18,000 students supervised by 705 professors and 500 administrative and technical staff distributed across six faculties: the Faculty of Science and Technology, the Faculty of Humanities and Social Sciences, the Faculty of Economics, Business and Management Sciences, the Faculty of Natural and Life Sciences, the Faculty of Arts and Languages, and the Faculty of Law and Political Science. The university measures its performance by its impact on its environment by participating in the training of professors, researchers, and executives for administrations and companies."}
                </p>
                <p>
                  {i18n.language === "ar"
                    ? "من ملحق لجامعة باتنة عام 1999 ، ثم مركزا جامعيا من 2001 إلى 2012 ، ليتم ترقيته إلى مصاف الجامعات ، تحمل اسم رمز الثورة في المنطقة الشهيد عباس لغرور. تقدم الجامعة من خلال كلياتها 41 تكوين ليسانس و 46 تكوين ماستر والعديد من تكوينات الدكتوراه مدعومة بـ 9 مختبرات بحثية معتمدة."
                    : "From an annex to the University of Batna in 1999, to a university center from 2001 to 2012, it was later upgraded to university status, bearing the name of the region's revolutionary icon, the martyr Abbas Laghrour. Through its faculties, the university offers 41 bachelor's programs, 46 master's programs, and numerous doctoral programs, supported by nine accredited research laboratories."}
                </p>
              </div>
            </div>
            <div>
              <img
                src="/public/public/about/1.webp?height=400&width=600"
                alt="University History"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("about.mission")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-university-blue/10 rounded-full mb-6">
                  <value.icon className="h-8 w-8 text-university-blue" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Administration */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("about.administration")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: i18n.language === "ar" ? "البروفيسور شالة عبد الواحد" : "Professor abdouahed Chala",
                position: i18n.language === "ar" ? "مدير الجامعة" : "University Rector",
                image: "/public/public/about/chala.jpeg?height=300&width=300",
              },
              {
                name: i18n.language === "ar" ? "د. فاطمة العلوي" : "Dr. Fatima Alaoui",
                position:
                  i18n.language === "ar" ? "نائب مدير الجامعة للشؤون الأكاديمية" : "Vice-Rector for Academic Affairs",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: i18n.language === "ar" ? "د. محمد الصالح" : "Dr. Mohamed Salah",
                position:
                  i18n.language === "ar" ? "نائب مدير الجامعة للبحث العلمي" : "Vice-Rector for Scientific Research",
                image: "/placeholder.svg?height=300&width=300",
              },
            ].map((admin, index) => (
              <div key={index} className="card text-center">
                <img
                  src={admin.image || "/placeholder.svg"}
                  alt={admin.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{admin.name}</h3>
                <p className="text-university-blue font-medium">{admin.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-16 bg-university-blue text-white">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-8">
            {i18n.language === "ar" ? "الاعتماد والشراكات" : "Accreditation & Partnerships"}
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            {i18n.language === "ar"
              ? "جامعة خنشلة معتمدة من وزارة التعليم العالي والبحث العلمي الجزائرية ولها شراكات مع جامعات عالمية مرموقة"
              : "University of Khenchela is accredited by the Algerian Ministry of Higher Education and Scientific Research and has partnerships with prestigious international universities"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/10 rounded-lg p-6">
                <img src={`/placeholder.svg?height=80&width=120`} alt={`Partner ${i}`} className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
