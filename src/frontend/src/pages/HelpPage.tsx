import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { APP_NAME, DELIVERY_PROMISE } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Truck,
  Wallet,
} from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "ordering",
    question: "How do I place an order?",
    answer:
      "Browse a category or search for an item, tap Add on the products you need, then open your Cart. Review the items, apply a coupon if you have one, choose a delivery address and confirm your order.",
  },
  {
    id: "delivery",
    question: "How long does delivery take?",
    answer: `We aim for ${DELIVERY_PROMISE.toLowerCase()} on all serviceable pincodes. Delivery slots are shown at checkout, and you can track your order status from the Orders tab.`,
  },
  {
    id: "payments",
    question: "What payment methods can I use?",
    answer:
      "You can choose Cash on Delivery or Pay Online at checkout. Online payment is recorded as your preferred method; our team confirms the payment details with you before dispatch.",
  },
  {
    id: "returns",
    question: "What is your return and refund policy?",
    answer:
      "Fresh produce and perishables can be reported within 24 hours of delivery if they arrive damaged or spoiled. Packaged goods can be returned within 7 days if unopened. Refunds are processed to your original payment method within 3–5 working days.",
  },
  {
    id: "missing",
    question: "An item is missing from my order. What now?",
    answer:
      "Open the order from the Orders tab and note the missing item. Reach out to our support team with your order number and we will arrange a replacement or refund right away.",
  },
  {
    id: "coupons",
    question: "How do I use a coupon code?",
    answer:
      "Visit the Coupons page, copy the code you want, and paste it into the coupon field on your Cart before checkout. The discount is applied instantly if your order meets the minimum value.",
  },
];

const CONTACT_CHANNELS = [
  {
    id: "phone",
    icon: Phone,
    label: "Call us",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98765 43210",
    href: "https://wa.me/919876543210",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email",
    value: "support@rozanagrocery.in",
    href: "mailto:support@rozanagrocery.in",
  },
];

const TOPICS = [
  {
    id: "ordering",
    icon: Wallet,
    title: "Ordering & payments",
    description: "Placing orders, coupons and payment options.",
  },
  {
    id: "delivery",
    icon: Truck,
    title: "Delivery & tracking",
    description: "Slots, charges and live order status.",
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & refunds",
    description: "Report issues and get your money back.",
  },
];

/** Help and support: contact channels, topics and an FAQ. */
export function HelpPage() {
  return (
    <Layout title="Help & Support">
      <div data-ocid="help_page" className="space-y-5">
        {/* Support hero */}
        <section
          data-ocid="help_hero"
          className="bg-gradient-primary rounded-xl px-4 py-5 text-primary-foreground shadow-elevated"
        >
          <h2 className="font-display text-lg font-extrabold leading-tight">
            We&apos;re here to help
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/85">
            Questions about an order, delivery or refund? Our {APP_NAME} support
            team is a message away.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary-foreground/85">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Open every day, 7 am – 11 pm
          </p>
        </section>

        {/* Contact channels */}
        <section
          data-ocid="help_contact_section"
          aria-labelledby="contact-heading"
        >
          <h2
            id="contact-heading"
            className="mb-2.5 font-display text-base font-bold tracking-tight text-foreground"
          >
            Contact us
          </h2>
          <div className="space-y-2.5">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.id}
                  href={channel.href}
                  target={channel.id === "whatsapp" ? "_blank" : undefined}
                  rel={channel.id === "whatsapp" ? "noreferrer" : undefined}
                  data-ocid={`help_contact_${channel.id}_link`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {channel.label}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {channel.value}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Support topics */}
        <section
          data-ocid="help_topics_section"
          aria-labelledby="topics-heading"
        >
          <h2
            id="topics-heading"
            className="mb-2.5 font-display text-base font-bold tracking-tight text-foreground"
          >
            Popular topics
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <div
                  key={topic.id}
                  data-ocid={`help_topic_${topic.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-subtle"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section data-ocid="help_faq_section" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="mb-2.5 font-display text-base font-bold tracking-tight text-foreground"
          >
            Frequently asked questions
          </h2>
          <div className="rounded-xl border border-border bg-card px-4 shadow-subtle">
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger
                    data-ocid={`help_faq_${item.id}_trigger`}
                    className="font-display text-sm font-semibold text-foreground"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Store info */}
        <section
          data-ocid="help_store_section"
          className="rounded-xl border border-border bg-card p-4 shadow-subtle"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {APP_NAME} Support Centre
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Shop 12, Market Road, Andheri West, Mumbai 400058
              </p>
            </div>
          </div>
        </section>

        <Button
          type="button"
          variant="outline"
          asChild
          className="w-full rounded-full"
        >
          <Link to="/orders" data-ocid="help_orders_link">
            View my orders
          </Link>
        </Button>
      </div>
    </Layout>
  );
}
