from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('socialmedia', '0001_initial'),
    ]

    operations = [
         migrations.CreateModel(
             name = 'Genre',
             fields=[
                 ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                 ('name', models.CharField(max_length=100)),
                 ('createdAt', models.DateField(blank = True, null= True)),
             ],
         ),
    ]