"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với
            chúng tôi nếu bạn có bất kỳ câu hỏi nào.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
                Thông tin liên hệ
              </h2>
              <p className="text-gray-600 mb-8">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi
                qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p className="text-gray-600">
                    Lê Trung Nghĩa, Phường Bảy Hiền,
                    <br />
                    Thành phố Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Điện thoại
                  </h3>
                  <p className="text-gray-600">
                    <a
                      href="tel:+84853783578"
                      className="hover:text-amber-600 transition-colors"
                    >
                      +84 853 785 378
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    <a
                      href="mailto:info@aura.com"
                      className="hover:text-amber-600 transition-colors"
                    >
                      info@aura.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Giờ làm việc
                  </h3>
                  <p className="text-gray-600">
                    Thứ 2 - Thứ 6: 8:00 - 18:00
                    <br />
                    Thứ 7: 8:00 - 12:00
                    <br />
                    Chủ nhật: Nghỉ
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">
                Theo dõi chúng tôi
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-amber-600 text-white rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors"
                >
                  <span className="text-sm font-semibold">f</span>
                </a>
                {/* <a href="#" className="w-10 h-10 bg-pink-500 text-white rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <span className="text-sm font-semibold">ig</span>
                </a>
                <a href="#" className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-sm font-semibold">tw</span>
                </a> */}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">
              Gửi tin nhắn
            </h2>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cảm ơn bạn!
                </h3>
                <p className="text-gray-600">
                  Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong
                  thời gian sớm nhất.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg text-gray-700"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg text-gray-700"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg text-gray-700"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg text-gray-700"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Câu hỏi chung</option>
                    <option value="product">Về sản phẩm</option>
                    <option value="order">Đơn hàng</option>
                    <option value="return">Đổi trả</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg text-gray-700"
                    placeholder="Nhập tin nhắn của bạn..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center group"
                >
                  <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Gửi tin nhắn
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6 text-center">
            Vị trí cửa hàng
          </h2>
          <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Bản đồ sẽ được hiển thị ở đây</p>
              <p className="text-sm text-gray-400 mt-2">
                Lê Trung Nghĩa, Phường Bảy Hiền, TP.HCM
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
