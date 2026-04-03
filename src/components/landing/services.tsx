import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import {
  ServiceAwsIcon,
  ServiceBlockchainIcon,
  ServiceHtml5Icon,
  ServiceMobileIcon,
  ServiceRealtimeIcon,
  ServiceWebResponsiveIcon,
} from '@/icons/icons';
import { cn } from '@/utils/cn';

const serviceList = [
  {
    key: 'aws',
    title: 'AWS Cloud',
    subtitle:
      'Our Service based on AWS Cloud Service for Security and Stability.',
    icon: <ServiceAwsIcon />,
  },
  {
    key: 'blockchain',
    title: 'Blockchain',
    subtitle:
      'It ensures transparency and stability and can participate in predictive platforms.',
    icon: <ServiceBlockchainIcon />,
  },
  {
    key: 'html5',
    title: 'HTML5 Web Standard',
    subtitle:
      'Developed by HTML5 Web Standard to support a variety of browsers.',
    icon: <ServiceHtml5Icon />,
  },
  {
    key: 'mobile',
    title: 'Mobile Application',
    subtitle: 'Any Where! Any Time! You can enjoy with Mobile.',
    icon: <ServiceMobileIcon />,
  },
  {
    key: 'responsibleWeb',
    title: 'Responsible Web',
    subtitle:
      'It is possible to participate in services from browsers on various devices through Responsible Web.',
    icon: <ServiceWebResponsiveIcon />,
  },
  {
    key: 'realtime',
    title: 'Realtime Service',
    subtitle:
      'If you have any questions about the service, please feel free to contact us.',
    icon: <ServiceRealtimeIcon />,
  },
];

const ServiceCard = ({
  serviceKey,
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  serviceKey: string;
  title: string;
  subtitle: string;
}) => {
  return (
    <Card
      className={cn(
        'flex flex-col items-center border-2 bg-white text-center',
        'px-3 pt-6 pb-10 rounded-2xl',
        'lg:px-10 md:py-14 md:rounded-14',
        'xl:px-[63px] xl:py-[70px] xl:rounded-14',
        {
          'col-span-2 lg:col-span-1':
            serviceKey === 'responsibleWeb' || serviceKey === 'realtime',
        },
      )}
    >
      {icon}
      <Typography className="mt-4 text-base md:text-xl lg:mt-8" level="h4">
        {title}
      </Typography>
      <Typography className="mt-4 text-sm">{subtitle}</Typography>
    </Card>
  );
};

export const Services = () => {
  return (
    <div
      className="w-full rounded-t-14 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/assets/images/what-is-boom-play-bg.png)',
      }}
    >
      <div className="app-container py-10 lg:py-16">
        <div className="mb-10 text-center text-white">
          <Typography
            className="mb-2 font-clash-display text-2xl font-semibold md:mb-4 md:text-[32px]"
            level="h2"
          >
            FORECAST Service
          </Typography>
          <Typography level="h5" className="text-sm font-normal md:text-base">
            Operate the Service Through Advanced Technology
          </Typography>
        </div>
        <div className="grid w-full grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-10">
          {serviceList.map(item => (
            <ServiceCard {...item} serviceKey={item.key} key={item.key} />
          ))}
        </div>
      </div>
    </div>
  );
};
