from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('socialmedia', '0001_initial'),
    ]

    operations = [
         migrations.CreateModel(
             name = 'Country',
             fields=[
                 ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                 ('name', models.TextField(blank = True, null = True)),
                 ('lat', models.FloatField(blank = True, null = True)),
                 ('lon', models.FloatField(blank = True, null = True)),
                 ('region', models.TextField(blank = True, null = True))
             ],
         ),
    ]