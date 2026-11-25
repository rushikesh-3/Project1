import React from 'react'
import Title from './Title'

const benefits = [
  { title: 'Search by your dates', text: 'Check the rental period before sending a booking request so you can browse cars that are available.' },
  { title: 'Clear booking status', text: 'Track whether a request is pending, confirmed, completed, or cancelled from your bookings page.' },
  { title: 'Local rental fleet', text: 'Browse vehicles managed by our rental team in LB Nagar, BN Reddy, KPHB, and Miyapur.' },
]

export default function Testimonial() {
  return <section className="px-6 py-20 md:px-16 lg:px-24 xl:px-32"><Title title="A straightforward car rental experience" subTitle="Everything you need to find a car and keep track of a booking."/><div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">{benefits.map(item=><article key={item.title} className="rounded-xl border border-borderColor bg-white p-6 shadow-sm"><h3 className="text-lg font-medium text-gray-900">{item.title}</h3><p className="mt-3 leading-6 text-gray-500">{item.text}</p></article>)}</div></section>
}
