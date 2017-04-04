from netCDF4 import Dataset as NetCDFFile
import datetime

nc = NetCDFFile('Maumee.nc')

dates = nc.variables['time'][:]
drp = nc.variables['drp'][:]
tp = nc.variables['tp'][:]
q = nc.variables['q'][:]
flags = nc.variables['flags'][:]

thefile = open('data2.js', 'w')
thefile.write("//Created on {0}\n\n dailyData = [\n".format(datetime.datetime.now()))


for i in range(len(dates)):
    thefile.write("["'"{0}"'",{1},{2},{3}],\n".format(datetime.datetime.fromtimestamp(int(dates[i])).strftime('%Y/%m/%d'),tp[i],drp[i],q[i]))

thefile.write("];")
thefile.close();
