import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Home, 
  HeartHandshake, 
  Users, 
  MapPin, 
  Megaphone, 
  TreePine, 
  Recycle,
  Phone,
  Mail,
  MapPin as LocationIcon
} from 'lucide-react';

const HomePage = () => {
  const quickAccessServices = [
    {
      name: 'Water Connection',
      description: 'Apply for a new water connection',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXDxyGUz0XJDJZ6Osz-Mh0taxg6Le8o2mFeXKbQX7WIBE36TXzbeIGC2RE5o5uv0oU9N3HxZUcc_CBBKRRKKnFM7PhCk1kzjQzhnl0YVm9B81Tv86QabFUYI2m0DynIT5Q0v9pRAYX4LSESnfMiz8YBJlqL_VcQ0d-jhX2uJNGs2ZBiYxZQrxJIdwfAmZ0hpvSwNTYhpKnSvWgBDL1K3vDhNxu2KIm4umGnWeas5JFtkzBydm8HETw50b0ioHeZ8nIfYF03FcFcBs',
      href: '/applications/new?category=water_connection'
    },
    {
      name: 'Road Maintenance',
      description: 'Report road maintenance issues',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUiLkoqMaWpL13GymL7xOf8PFwKnWOnY0o0wIHxJdTutHcK90TwNkmwzG4xVkFzNIFve5QBt0mwericd7JQfriaO3YvlHuk_sACV73sIOhadtIovI1jo3NRFMjASPH6hAVI-YhOtgah-UJy1uEmhCxQNTK8CUEIyl92wvJCnapRxHq67bH0h-bfdKLLgs-izPcg49WfBgQYg4VPawuJDBzpWslsOhPCT8ROHAGzNcipo1bBHOoBLKwW62Ul8Si5hz1_Y2tfAZl4g',
      href: '/grievances/new?category=road_maintenance'
    },
    {
      name: 'Community Hall Booking',
      description: 'Book the community hall for events',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXVVNfKLSA-8F9leptap-P9SvDu9eKiHvdPrWZXZPKdPQLLOj3iuHmJK6os9hPk8fmCdKneAEx0QJ4iVTLqxfCfQ2Y_VpThA5O8BP6OBB0wZ4vS4eSDj4Uy7nrF12j2XFfm1SQg7fQX7v7N2RWxChPUY_9Q1aTfbGiCbbu5DM2CEpG5x_3vgYUqOfdHwDxdqoZPfAK7IKxFK8D0rxGd90ucysWu0Yz39tAphRGdSfcEg2FhR0u-mH7pEZ3BW0JGtmVxmiIlL0hQdM',
      href: '/applications/new?category=hall_booking'
    },
    {
      name: 'Sanitation Services',
      description: 'Request sanitation services',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWiH4H6fuI6eF2tfNVeX7ShTUirwyh7EupT-hr43Rb5ZFE0cnJab22uGJggS6pjh43wKO1ICMB8fMZR3_nBqjeC1IEHNIw5G0bHTKr1b3WxZc8n58VIdtJpfuacJjCRBghYCngQkanEh3yIcR4QDWwDRtUiHcKzO1tIAuoiMRHrVsRWNVrKKnc7SlUaDEezcL_Z_w7lMYrSFxQbieZhce7L8DQghFD1Omv0HRl78JsVOo8s8E3XP5-Pw8a94FJnmV1zVgcOGynK8Y',
      href: '/grievances/new?category=garbage_collection'
    }
  ];

  const essentialServices = [
    {
      name: 'Property Tax',
      hindi: 'संपत्ति कर',
      icon: Home,
      description: 'Pay your property taxes online with ease. आसानी से अपने संपत्ति कर का ऑनलाइन भुगतान करें।'
    },
    {
      name: 'Certificates',
      hindi: 'प्रमाण पत्र',
      icon: FileText,
      description: 'Apply for birth & death certificates digitally. जन्म और मृत्यु प्रमाण पत्र के लिए डिजिटल रूप से आवेदन करें।'
    },
    {
      name: 'Government Schemes',
      hindi: 'सरकारी योजनाएं',
      icon: HeartHandshake,
      description: 'Explore and apply for various government schemes. विभिन्न सरकारी योजनाओं का पता लगाएं और आवेदन करें।'
    },
    {
      name: 'Community Services',
      hindi: 'सामुदायिक सेवाएं',
      icon: Users,
      description: 'Access community services and facilities. सामुदायिक सेवाओं और सुविधाओं तक पहुंचें।'
    },
    {
      name: 'Infrastructure',
      hindi: 'अवसंरचना',
      icon: MapPin,
      description: 'Report infrastructure issues and maintenance requests. अवसंरचना की समस्याओं और रखरखाव अनुरोधों की रिपोर्ट करें।'
    },
    {
      name: 'Announcements',
      hindi: 'घोषणाएं',
      icon: Megaphone,
      description: 'Stay updated with latest panchayat announcements. नवीनतम पंचायत घोषणाओं के साथ अपडेट रहें।'
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 9876543210',
      description: 'Call us for immediate assistance'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@egrampanchayat.gov.in',
      description: 'Send us your queries via email'
    },
    {
      icon: LocationIcon,
      title: 'Address',
      value: 'Gram Panchayat Office, Village Road',
      description: 'Visit us at our office'
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to{' '}
              <span className="text-primary">e-Gram Panchayat</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
              Digital Village Council Management System
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
              आपके ग्राम पंचायत में डिजिटल शासन और नागरिक सेवाएं
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Explore Services
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                View Schemes
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Quick access to the most commonly used services
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickAccessServices.map((service, index) => (
              <Link
                key={index}
                to={service.href}
                className="group block"
              >
                <div className="aspect-square w-full rounded-xl bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                     style={{ backgroundImage: `url(${service.image})` }}>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Essential Services */}
      <section className="py-16 bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Essential Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Complete range of digital governance services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {essentialServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {service.hindi}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get in touch with us for any assistance
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-background-light dark:bg-gray-800 rounded-xl"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary mb-4">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-primary font-medium mb-2">
                    {contact.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {contact.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-primary-100">
              Serving the community with digital excellence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Applications Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Digital Access</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Services Available</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;