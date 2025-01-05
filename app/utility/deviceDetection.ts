import { Request } from 'express';
import geoip from 'geoip-lite';

export const detectDeviceType = (userAgent: string): string => {
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
};

export const detectOsName = (userAgent: string): string => {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios/i.test(userAgent)) return 'iOS';
  return 'Unknown';
};

export const getIpAddress = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor || req.ip || '0.0.0.0';
  return ip === '::1' ? '127.0.0.1' : ip;
};

export const getGeoLocation = (ip: string): string => {
  return geoip.lookup(ip)?.city || 'Unknown';
};
