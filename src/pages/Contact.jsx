"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"

const Contact = () => {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
      alert(i18n.language === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!")
    }, 2000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: i18n.language === "ar" ? "العنوان" : "Address",
      content:
        i18n.language === "ar"
          ? "خنشلة، الجزائر، ص ب 1252 طريق أم البواقي 40004"
          : "University of Khenchela, Khenchela 40000, Algeria",
    },
    {
      icon: Phone,
      title: i18n.language === "ar" ? "الهاتف" : "Phone",
      content: "+213 032 73 12 36",
    },
    {
      icon: Mail,
      title: i18n.language === "ar" ? "البريد الإلكتروني" : "Email",
      content: "contact@univ-khenchela.dz",
    },
    {
      icon: Clock,
      title: i18n.language === "ar" ? "ساعات العمل" : "Office Hours",
      content: i18n.language === "ar" ? "الأحد - الخميس: 8:00 - 16:00" : "Sunday - Thursday: 8:00 AM - 4:00 PM",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-university-blue text-white py-20">
        <div className="page-container">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{t("nav.contact")}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {i18n.language === "ar"
                ? "نحن هنا للإجابة على استفساراتكم ومساعدتكم"
                : "We're here to answer your questions and help you"}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {i18n.language === "ar" ? "أرسل لنا رسالة" : "Send us a Message"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder={i18n.language === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder={i18n.language === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder={i18n.language === "ar" ? "موضوع الرسالة" : "Message subject"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {i18n.language === "ar" ? "الرسالة" : "Message"}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder={i18n.language === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                      {i18n.language === "ar" ? "إرسال الرسالة" : "Send Message"}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {i18n.language === "ar" ? "معلومات الاتصال" : "Contact Information"}
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="bg-university-blue/10 rounded-lg p-3">
                        <info.icon className="h-6 w-6 text-university-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-gray-600">{info.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {i18n.language === "ar" ? "موقع الجامعة" : "University Location"}
                </h3>
                <div className="overflow-hidden rounded-xl shadow-md w-full h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3233.071989400242!2d7.089049275708087!3d35.47172867262812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f6d9828debba5b%3A0x483d09e19b6d8290!2sUniversit%C3%A9%20Abbes%20Laghrour%20Khenchela!5e0!3m2!1sen!2sdz!4v1716736900223!5m2!1sen!2sdz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Contact */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {i18n.language === "ar" ? "اتصل بالأقسام" : "Contact Departments"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: i18n.language === "ar" ? "شؤون الطلاب" : "Student Affairs",
                email: "students@univ-khenchela.dz",
                phone: "+213 32 XX XX 01",
              },
              {
                name: i18n.language === "ar" ? "القبول والتسجيل" : "Admissions",
                email: "admissions@univ-khenchela.dz",
                phone: "+213 32 XX XX 02",
              },
              {
                name: i18n.language === "ar" ? "البحث العلمي" : "Research",
                email: "research@univ-khenchela.dz",
                phone: "+213 32 XX XX 03",
              },
              {
                name: i18n.language === "ar" ? "الشؤون الأكاديمية" : "Academic Affairs",
                email: "academic@univ-khenchela.dz",
                phone: "+213 32 XX XX 04",
              },
              {
                name: i18n.language === "ar" ? "المكتبة" : "Library",
                email: "library@univ-khenchela.dz",
                phone: "+213 32 XX XX 05",
              },
              {
                name: i18n.language === "ar" ? "الدعم التقني" : "IT Support",
                email: "it@univ-khenchela.dz",
                phone: "+213 32 XX XX 06",
              },
            ].map((dept, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{dept.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-university-blue" />
                    <a href={`mailto:${dept.email}`} className="hover:text-university-blue">
                      {dept.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-university-blue" />
                    <a href={`tel:${dept.phone}`} className="hover:text-university-blue">
                      {dept.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
