import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Your Company",
  description: "Get in touch with Your Company. Find our contact information and send us a message.",
};

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <main>
        <h1 className="text-5xl font-display mb-8">Contact Us!</h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {/* <h2 className="text-3xl font-display mb-6">Get In Touch</h2> */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-medium text-gray-900">Email</h3>
                <p className="text-gray-600 font-sans">hq@mavenstudios.org</p>
              </div>
              <div>
                <h3 className="font-serif font-medium text-gray-900">Address</h3>
                <p className="text-gray-600 font-sans">
                  2 Embarcadero Center<br />
                  San Francisco, CA 94306
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-display mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-serif font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-serif font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-serif font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}